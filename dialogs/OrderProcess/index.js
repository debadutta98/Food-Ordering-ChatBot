const { CardFactory } = require("botbuilder");
const {
  ComponentDialog,
  WaterfallDialog,
  NumberPrompt,
  Dialog,
  ConfirmPrompt,
  DialogReason,
} = require("botbuilder-dialogs");
const {
  getAddressDetails,
  getallAddress,
  getDefaultAddress,
  deleteOrder,
} = require("../../db/Curd");
const { Constant } = require("../../helper/Constant");
const { mealsIngrediants } = require("../../api/mealCategories");
const NUMBER_PROMPT = "NUMBER_PROMPT";
const CONFIRM_PROMPT = "CONFIRM_PROMPT";
const { Address } = require("../Address");
const { Payment } = require("../Payment");
const { orderDetails } = require("../../Cards/Orderdetails");
class OrderProcess extends ComponentDialog {
  constructor(userState, conversationState) {
    super(Constant.dialogIds.orderProcessing);
    this.userState = userState;
    this.conversationState = conversationState;
    this.conversationData = this.conversationState.createProperty(
      "ORDER_PROCEE_CONVERSATIONSTATE"
    );
    this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.quantityValidate));
    this.addDialog(new Address(userState, conversationState));
    this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
    this.addDialog(new Payment(userState, conversationState));
    this.addDialog(
      new WaterfallDialog(Constant.dialogIds.orderProcessing, [
        this.askForQuantity.bind(this),
        this.askForAddress.bind(this),
        this.selectAddressDetails.bind(this),
        this.showOrderDetails.bind(this),
        this.proceedtopay.bind(this),
      ])
    );
    this.initialDialogId = Constant.dialogIds.orderProcessing;
  }
  async askForQuantity(step) {
    if (step.options && step.options.quantity) {
      return await step.next(step.options.quantity);
    } else {
      await step.prompt(NUMBER_PROMPT, {
        prompt: `Please enter the number of quanity of ${step.options.mealsDetails.mealname} you want to order `,
        retryPrompt: "Please Enter a valid number and a number between 1 to 10",
      });
      return Dialog.EndOfTurn;
    }
  }
  async askForAddress(step) {
    if (step.result) {
      step.values.quantity = step.result;
      const address = await getDefaultAddress(step.options.logindetails.uid);
      if (address) {
        await step.prompt(
          CONFIRM_PROMPT,
          "Do you want to change or add new Delivery address",
          ["yes", "no"]
        );
      } else {
        await step.context.sendActivity(
          "It seems that you didn't update your current location"
        );
        return await step.next(true);
      }
    }
    return Dialog.EndOfTurn;
  }
  async selectAddressDetails(step) {
    if (step.result) {
      return await step.beginDialog(Constant.dialogIds.addressDialogId, {
        ...step.options.logindetails,
        dialogId: Constant.dialogIds.orderProcessing,
      });
    } else {
      return await step.next(false);
    }
  }
  async showOrderDetails(step) {
    if (step.result) {
      if (step.result.addressid) {
        //call getAddressDetails
        const address_details = await getAddressDetails(
          step.options.logindetails.uid,
          step.result.addressid
        );
        if (address_details) {
          const ingridients = await mealsIngrediants(
            step.options.mealsDetails.mealid
          );
          if (ingridients && !ingridients.error) {
            await step.context.sendActivity({
              attachments: [
                CardFactory.adaptiveCard(
                  orderDetails(
                    step.values.quantity,
                    ingridients,
                    step.options.mealsDetails,
                    address_details
                  )
                ),
              ],
            });
            return Dialog.EndOfTurn;
          }
        } else {
          await step.context.sendActivity(
            "Due to some technical issues we couldn't fetch your data"
          );
          return await step.replaceDialog(this.id, step.options);
        }
      } else {
        //call the card
        console.log(step.result.address_details);
        const ingridients = await mealsIngrediants(
          step.options.mealsDetails.mealid
        );
        if (ingridients && !ingridients.error) {
          console.log(step.result.address_details);
          await step.context.sendActivity({
            attachments: [
              CardFactory.adaptiveCard(
                orderDetails(
                  step.values.quantity,
                  ingridients,
                  step.options.mealsDetails,
                  step.result.address_details
                )
              ),
            ],
          });
          return Dialog.EndOfTurn;
        } else {
          await step.context.sendActivity(
            "Due to some technical issues we couldn't fetch your data"
          );
          return await step.replaceDialog(this.id, step.options);
        }
      }
    } else {
      //getDefaultDeliveryAddress
      const address_details = await getallAddress(
        step.options.logindetails.uid
      );
      if (address_details) {
        for (let key in address_details) {
          if (address_details[key].default) {
            const ingridients = await mealsIngrediants(
              step.options.mealsDetails.mealid
            );
            if (ingridients && !ingridients.error) {
              await step.context.sendActivity({
                attachments: [
                  CardFactory.adaptiveCard(
                    orderDetails(
                      step.values.quantity,
                      ingridients,
                      step.options.mealsDetails,
                      address_details[key].single_address
                    )
                  ),
                ],
              });
              return Dialog.EndOfTurn;
            } else {
              await step.context.sendActivity(
                "Due to some technical issues we couldn't fetch your data"
              );
              return await step.replaceDialog(this.id, step.options);
            }
          }
        }
        await step.context.sendActivity(
          `Didn't find current Delivery Address Please Enter the Details Again`
        );
        return await step.replaceDialog(this.id, step.options);
      } else {
        await step.context.sendActivity(
          `Hey ${step.options.logindetails.name} i might seem that you didn't add your delivery orders or there may be connection issues please try again `
        );
        return await step.replaceDialog(this.id, step.options);
      }
    }
    return Dialog.EndOfTurn;
  }
  async proceedtopay(step) {
    if (
      step.context.activity.value &&
      step.context.activity.value.button === "proceed"
    ) {
      if (step.options.orderid) {
        await deleteOrder(step.options.logindetails.uid, step.options.orderid);
      }
      await step.context.sendActivity(
        "Please wait for some time we need sometimes to create and prepared your order"
      );
      return await step.beginDialog(Constant.dialogIds.paymentDialogId, {
        logindetails: step.options.logindetails,
        items: step.options.mealsDetails,
        quantity: step.values.quantity,
        type: step.context.activity.value.type,
        amount: step.context.activity.value.amount,
        address: step.context.activity.value.address,
      });
    } else if (
      step.context.activity.value &&
      step.context.activity.value.button === "cancel"
    ) {
      await step.context.sendActivity(
        "OK,fine we don't proceed with your current order details but you can see more food items from our item list"
      );
      return await step.replaceDialog(Constant.dialogIds.rootDialogID);
    }
  }
  async quantityValidate(promptContext) {
    return (
      promptContext.recognized.succeeded &&
      promptContext.recognized.value >= 1 &&
      promptContext.recognized.value <= 10
    );
  }
}
module.exports.OrderProcess = OrderProcess;
