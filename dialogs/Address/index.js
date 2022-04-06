const { CardFactory, TurnContext, ActivityTypes } = require("botbuilder");
const {
  ComponentDialog,
  WaterfallDialog,
  ChoicePrompt,
  ChoiceFactory,
  Dialog,
  DialogReason,
  DialogTurnStatus,
} = require("botbuilder-dialogs");
const { getLocation } = require("../../api/getLocation");
const { addnewAddress } = require("../../Cards/addnewAddress");
const { deleteAddress } = require("../../Cards/deleteAddress");
const { setDefaultAddress } = require("../../Cards/setDefaultAddress");
const { showAllAddress } = require("../../Cards/showAllAddress");
const {
  addAddressDetails,
  getallAddress,
  deleteUserAddress,
  setDeliveryAddress,
  getDefaultAddress,
} = require("../../db/Curd");
const { Constant } = require("../../helper/Constant");
const CHOICE_PROMPT = "CHOICE_PROMPT";
class Address extends ComponentDialog {
  constructor(userState, conversationState) {
    super(Constant.dialogIds.addressDialogId);
    this.userState = userState;
    this.conversationState = conversationState;
    this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
    this.addDialog(
      new WaterfallDialog(Constant.dialogIds.addressDialogId, [
        this.askForAddressOperation.bind(this),
        this.addressOperation.bind(this),
        this.addressConfirmation.bind(this),
      ])
    );
    this.initialDialogId = Constant.dialogIds.addressDialogId;
  }
  async askForAddressOperation(step) {
    if (step.options.operation) {
      return await step.next(step.options.operation);
    } else {
      await step.context.sendActivity(
        ChoiceFactory.heroCard(
          step.options.dialogId
            ? Constant.AddressOperations.filter(
                (value, index) => index !== 2 && index !== 1
              )
            : Constant.AddressOperations,
          "Please select a address operation"
        )
      );
    }
    return Dialog.EndOfTurn;
  }
  async addressOperation(step) {
    /*     "Add new address",
            "show all address",
            "delete address",
            "change default address";*/
    if (step.result && step.result !== "") {
      const conversationreference = TurnContext.getConversationReference(
        step.context.activity
      );
      switch (step.result.trim()) {
        case Constant.AddressOperations[0]:
          await step.context.sendActivity({
            value: encodeURI(
              `${process.env.BASE_URL}/pick-location/?uid=${step.options.uid}&refId=${conversationreference.conversation.id}`
            ),
            attachments: [
              CardFactory.adaptiveCard(
                addnewAddress(
                  step.options.uid,
                  conversationreference.conversation.id
                )
              ),
            ],
          });
          break;
        case Constant.AddressOperations[1]:
          const alladdressList = await getallAddress(step.options.uid);
          if (alladdressList) {
            await step.context.sendActivity({
              attachments: [
                CardFactory.adaptiveCard(showAllAddress(alladdressList)),
              ],
            });
            return await step.replaceDialog(Constant.dialogIds.rootDialogID);
          } else {
            await step.context.sendActivity(
              "Unable to fetch your information please try again"
            );
            return await step.replaceDialog(this.id, step.options);
          }
          break;
        case Constant.AddressOperations[2]:
          const addressList = await getallAddress(step.options.uid);
          if (addressList) {
            await step.context.sendActivity({
              attachments: [
                CardFactory.adaptiveCard(deleteAddress(addressList)),
              ],
            });
          } else {
            await step.context.sendActivity(
              "Unable to fetch your information please try again"
            );
            return await step.replaceDialog(this.id, step.options);
          }
          break;
        case Constant.AddressOperations[3]:
          const address_List = await getallAddress(step.options.uid);
          if (address_List) {
            await step.context.sendActivity({
              attachments: [
                CardFactory.adaptiveCard(setDefaultAddress(address_List)),
              ],
            });
          } else {
            await step.context.sendActivity(
              "Unable to fetch your information please try again"
            );
            return await step.replaceDialog(this.id, step.options);
          }
          break;
      }
    }
    return Dialog.EndOfTurn;
  }
  async addressConfirmation(step) {
    if (step.context.activity.value && step.context.activity.value.button) {
      switch (step.context.activity.value.button) {
        case "deleteaddress":
          console.log(step.context.activity.value);
          let c = 0;
          for (let addressid of Object.values(step.context.activity.value)) {
            if (addressid !== "false") {
              c++;
              await deleteUserAddress(step.options.uid, addressid);
            }
          }
          if (c == 0) {
            await step.context.sendActivity(
              `you didn't select any option from the list`
            );
            return await step.replaceDialog(Constant.dialogIds.rootDialogID);
          } else {
            await step.context.sendActivity(`Address Deleted Successfully`);
            return await step.replaceDialog(Constant.dialogIds.rootDialogID);
          }
          break;
        case "addnewaddress":
          await getLocation(step.context.activity.value)
            .then(async (res) => {
              if (res && !res.error) {
                let { street, city, State, country, postalcode, type } =
                  step.context.activity.value;
                await addAddressDetails(step.options.uid, {
                  address_details: {
                    street,
                    city,
                    State,
                    country,
                    postalcode,
                  },
                  type,
                  latitude: res.lat,
                  longitude: res.lon,
                  default: true,
                  single_address: res.display_name,
                }).then(async (isAdded) => {
                  if (isAdded) {
                    await step.context.sendActivity(
                      "This address is added successfully your address list"
                    );
                    if (step.options.dialogId) {
                      return await step.endDialog({
                        address_details: res.display_name,
                      });
                    } else {
                      return await step.replaceDialog(
                        Constant.dialogIds.rootDialogID
                      );
                    }
                  } else {
                    await step.context.sendActivity(
                      "Your Address is not added successfully please try again"
                    );
                    return await step.replaceDialog(this.id, step.options);
                  }
                });
              } else {
                await step.context.sendActivity("Address not found");
                return await step.replaceDialog(this.id, step.options);
              }
            })
            .catch(async (err) => {
              await step.context.sendActivity("Please try again");
              return await step.replaceDialog(this.id, step.options);
            });
          break;
        case "selectdefault":
          if (
            step.context.activity.value &&
            step.context.activity.value.addressid
          ) {
            if (
              await setDeliveryAddress(
                step.options.uid,
                step.context.activity.value.addressid
              )
            ) {
              await step.context.sendActivity({
                type: ActivityTypes.Message,
                text: "Delivery Adress is updated Successfully",
                value: { code: "3002" },
              });
              if (step.options.dialogId) {
                return await step.endDialog({
                  addressid: step.context.activity.value.addressid,
                });
              } else {
                return await step.replaceDialog(
                  Constant.dialogIds.rootDialogID
                );
              }
            } else {
              await step.context.sendActivity(
                "Delivery Address is not updated Successfully"
              );
              return await step.replaceDialog(this.id, step.options);
            }
          }
          break;
      }
    } else if (step.context.activity.value.tag === "ADDED_EXTERNALLY") {
      if (step.context.activity.value.isAdded) {
        if (step.options.dialogId) {
          let address = await getDefaultAddress(step.options.uid);
          if (address) {
            return await step.endDialog({
              address_details: address.single_address,
            });
          } else {
            await step.context.sendActivity(
              "Not able to get you current address Due to some technical issuses please try again later"
            );
            return await step.replaceDialog(Constant.dialogIds.rootDialogID);
          }
        } else {
          return await step.replaceDialog(Constant.dialogIds.rootDialogID);
        }
      } else {
        await step.context.sendActivity(
          "We are unable to update your address please try again"
        );
        return await step.replaceDialog(this.id, step.options);
      }
    }
    return { status: DialogTurnStatus.waiting };
  }
}
module.exports.Address = Address;
