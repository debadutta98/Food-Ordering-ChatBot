const {
  TurnContext,
  ActivityTypes,
  AttachmentLayoutTypes,
} = require("botbuilder");
const { CardFactory } = require("botbuilder-core");
const {
  ComponentDialog,
  WaterfallDialog,
  Dialog,
  ConfirmPrompt,
  DialogTurnStatus,
} = require("botbuilder-dialogs");
const { cartDetailsCard } = require("../../Cards/CartCards/ShowCartsDetails");
const {
  getAllCartItem,
  deleteCartItem,
  getDefaultAddress,
  deleteOrder,
  clearAllCartItems,
} = require("../../db/Curd");
const { Constant } = require("../../helper/Constant");
const { OrderProcess } = require("../OrderProcess");
const { Address } = require("../Address");
const { Payment } = require("../Payment");
const { sendCartDetails } = require("../../Cards/CartCards/OrderAllCartItem");
const CONFIRM_PROMPT_CART = "CONFIRM_PROMPT_CART";
class Cart extends ComponentDialog {
  constructor(userState, conversationState) {
    super(Constant.dialogIds.cartDialogId);
    this.userState = userState;
    this.conversationState = conversationState;
    this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT_CART));
    this.addDialog(new OrderProcess(userState, conversationState));
    this.addDialog(new Address(userState, conversationState));
    this.addDialog(new Payment(userState, conversationState));
    this.addDialog(
      new WaterfallDialog(Constant.dialogIds.cartDialogId, [
        this.showCartItem.bind(this),
        this.onSubmitEvent.bind(this),
        this.askforAddress.bind(this),
        this.redirectToAddress.bind(this),
        this.sendDetailsCard.bind(this),
        this.proceedTopay.bind(this),
      ])
    );
    this.initialDialogId = Constant.dialogIds.cartDialogId;
  }
  async showCartItem(step) {
    if (!step.options.orders) {
      const ALL_ITEM = await getAllCartItem(step.options.uid);
      if (ALL_ITEM.code) {
        await step.context.sendActivity({
          attachments: [
            CardFactory.adaptiveCard(
              cartDetailsCard(Object.entries(ALL_ITEM.data))
            ),
          ],
        });
      } else {
        await step.context.sendActivity(
          `Hi ${step.options.name} ${ALL_ITEM.message}`
        );
        return await step.replaceDialog(Constant.dialogIds.rootDialogID);
      }
    } else if (step.options.orders) {
      return await step.next(step.options.orders);
    }
    return Dialog.EndOfTurn;
  }
  async onSubmitEvent(step) {
    if (step.context.activity.value && step.context.activity.value.button) {
      switch (step.context.activity.value.button) {
        case "checkout":
          step.values.clearCart = true;
          let CART_ITEMS = step.context.activity.value.items.map(
            ([key, value], index) => {
              if (
                value.quantity !==
                +step.context.activity.value["quantity" + index]
              ) {
                value.quantity =
                  +step.context.activity.value["quantity" + index];
                return value;
              } else {
                return value;
              }
            }
          );
          if (CART_ITEMS.length == 1) {
            return await step.replaceDialog(
              Constant.dialogIds.orderProcessing,
              {
                logindetails: { ...step.options },
                mealsDetails: CART_ITEMS[0],
                quantity: CART_ITEMS[0].quantity,
              }
            );
          } else {
            return await step.next(CART_ITEMS);
          }
          break;
        case "notnow":
          return await step.replaceDialog(Constant.dialogIds.rootDialogID);
          break;
        case "remove":
          const isDeleted = await deleteCartItem(
            step.options.uid,
            step.context.activity.value.id
          );
          if (isDeleted) {
            await step.context.sendActivity(
              `${step.context.activity.value.name} is successfully removed from your cart`
            );
          } else {
            await step.context.sendActivity(`Unable to delete your item`);
          }
          return await step.replaceDialog(this.id, step.options);
        case "order":
          return await step.replaceDialog(Constant.dialogIds.orderProcessing, {
            logindetails: { ...step.options },
            mealsDetails: step.context.activity.value.mealdetails,
            quantity: Number.parseInt(
              step.context.activity.value[
                `quantity${step.context.activity.value.slno}`
              ]
            ),
          });
      }
    } else if (step.result && step.options.orders) {
      return await step.next(step.options.orders);
    }
    return Dialog.EndOfTurn;
  }
  async askforAddress(step) {
    if (step.result) {
      step.values.cartItem = step.result;
      const address = await getDefaultAddress(step.options.uid);
      if (address) {
        await step.prompt(
          CONFIRM_PROMPT_CART,
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
  async redirectToAddress(step) {
    if (step.result) {
      return await step.beginDialog(Constant.dialogIds.addressDialogId, {
        ...step.options,
        dialogId: Constant.dialogIds.cartDialogId,
      });
    } else {
      return await step.next(false);
    }
  }
  async sendDetailsCard(step) {
    const address_details = await getDefaultAddress(step.options.uid);
    if (address_details) {
      if (!step.options.orders) {
        await step.context.sendActivity({
          attachments: [
            CardFactory.adaptiveCard(
              sendCartDetails(
                address_details.single_address,
                step.values.cartItem
              )
            ),
          ],
        });
      } else {
        await step.context.sendActivity({
          attachments: [
            CardFactory.adaptiveCard(
              sendCartDetails(
                address_details.single_address,
                step.options.orders
              )
            ),
          ],
        });
      }
    } else {
      await step.context.sendActivity(
        `Hi ${step.options.name} we may't able to get your delivery location please try again`
      );
      return await step.replaceDialog(Constant.dialogIds.rootDialogID);
    }
    return Dialog.EndOfTurn;
  }
  async proceedTopay(step) {
    if (step.context.activity.value && step.context.activity.value.button) {
      if (step.context.activity.value.button === "proceed") {
        if (step.options.orderid) {
          await deleteOrder(step.options.uid, step.options.orderid);
        }
        if (step.values.clearCart) {
          await clearAllCartItems(step.options.uid);
        }
        let itemslist = {};
        step.context.activity.value.items.forEach((value, index) => {
          itemslist["item" + index] = value;
        });
        if (step.options && step.options.orders) {
          delete step.options["orders"];
        }
        return step.beginDialog(Constant.dialogIds.paymentDialogId, {
          logindetails: step.options,
          items: itemslist,
          quantity: step.context.activity.value.items.length,
          type: step.context.activity.value.type,
          amount: step.context.activity.value.items
            .map((value) => value.quantity * value.sellingprice)
            .reduce((total, num) => total + num, 0),
          address: step.context.activity.value.address,
        });
      } else if (step.context.activity.value.button === "cancel") {
        await step.context.sendActivity(
          "Ok we cancel the order for now but you can proceed with this order when you want to"
        );
        return await step.replaceDialog(Constant.dialogIds.rootDialogID);
      }
    }
    return Dialog.EndOfTurn;
  }
}
module.exports.Cart = Cart;
