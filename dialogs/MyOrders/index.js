const { CardFactory } = require("botbuilder-core");
const {
  ComponentDialog,
  WaterfallDialog,
  ChoiceFactory,
  Dialog,
  ConfirmPrompt,
} = require("botbuilder-dialogs");
const { resolve } = require("path");
const CONFIRM_PROMPT = "CONFIRM_PROMPT_MYORDER";
const { customAlphabet } = require("nanoid");
const { createRefund } = require("../../api/payment");
const { showFullOrderDetails } = require("../../Cards/Orders/ShowFullDetails");
const { successfulOrders } = require("../../Cards/Orders/SuccessfulOrders");
const { getLatestSuccessfulOrders, updateOrder } = require("../../db/Curd");
const { Constant } = require("../../helper/Constant");
const nanoid = customAlphabet("1234567890", 10);
const ejs = require("ejs");
const { sendMail } = require("../../api/sendMail");
const { getDate, getFullTime, compareTime } = require("../../helper/utility");
const { showPendingOrders } = require("../../Cards/Orders/PendingOrders");
const {
  showFullPendingDetails,
} = require("../../Cards/Orders/PendingFullDetails");
const { cancelOrders } = require("../../Cards/Orders/CancelOrders");
const {
  cancelOrderFullDetails,
} = require("../../Cards/Orders/CancelOrderFullDetails");
class MyOrders extends ComponentDialog {
  constructor(userState, conversationState) {
    super(Constant.dialogIds.myorderDialogId);
    this.userState = userState;
    this.conversationState = conversationState;
    this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
    this.addDialog(
      new WaterfallDialog(Constant.dialogIds.myorderDialogId, [
        this.askForActivity.bind(this),
        this.showOrderDetails.bind(this),
        this.showFullDetails.bind(this),
        this.askForConfirmation.bind(this),
        this.switchDialog.bind(this),
      ])
    );
    this.initialDialogId = Constant.dialogIds.myorderDialogId;
  }
  async askForActivity(step) {
    if (step.options && !step.options.order) {
      await step.context.sendActivity(
        ChoiceFactory.heroCard(
          Constant.OrdersCatagories,
          "Which type of order history do you want to see"
        )
      );
    } else {
      return await step.next(step.options.order);
    }
    return Dialog.EndOfTurn;
  }
  async showOrderDetails(step) {
    if (step.result) {
      if (
        typeof step.result === "string" &&
        step.result === Constant.OrdersCatagories[0]
      ) {
        //pending orders
        let orders = await getLatestSuccessfulOrders(
          step.options.uid,
          "PENDING"
        );
        if (orders) {
          await step.context.sendActivity({
            attachments: [CardFactory.adaptiveCard(showPendingOrders(orders))],
          });
        } else {
          await step.context.sendActivity(
            "Sorry you didn't order anything yet so please order something"
          );
          return await step.replaceDialog(Constant.dialogIds.rootDialogID);
        }
      } else if (
        typeof step.result === "string" &&
        step.result === Constant.OrdersCatagories[1]
      ) {
        //successful orders
        let orders = await getLatestSuccessfulOrders(
          step.options.uid,
          "SUCCESS"
        );
        if (orders) {
          await step.context.sendActivity({
            attachments: [CardFactory.adaptiveCard(successfulOrders(orders))],
          });
        } else {
          await step.context.sendActivity(
            "Sorry you didn't order anything yet so please order something"
          );
          return await step.replaceDialog(Constant.dialogIds.rootDialogID);
        }
      } else if (
        typeof step.result === "string" &&
        step.result === Constant.OrdersCatagories[2]
      ) {
        let orders = await getLatestSuccessfulOrders(
          step.options.uid,
          "CANCELED"
        );
        if (orders) {
          await step.context.sendActivity({
            attachments: [CardFactory.adaptiveCard(cancelOrders(orders))],
          });
        } else {
          await step.context.sendActivity(
            "Sorry i didn't find any cancel order"
          );
          return await step.replaceDialog(Constant.dialogIds.rootDialogID);
        }
      } else if (typeof step.result === "object") {
        if (step.result && step.result.buttoninherit === "success") {
          return await step.next(step.result);
        } else if (step.result.orders_status === "SUCCESS") {
          await step.context.sendActivity({
            attachments: [
              CardFactory.adaptiveCard(
                successfulOrders(step.result.attachments_payload)
              ),
            ],
          });
        } else if (step.result.orders_status === "PENDING") {
          await step.context.sendActivity({
            attachments: [
              CardFactory.adaptiveCard(
                showPendingOrders(step.result.attachments_payload)
              ),
            ],
          });
        } else if (step.result.orders_status === "CANCELED") {
          await step.context.sendActivity({
            attachments: [
              CardFactory.adaptiveCard(
                cancelOrders(step.result.attachments_payload)
              ),
            ],
          });
        }
      }
    }
    return Dialog.EndOfTurn;
  }
  async showFullDetails(step) {
    if (
      step.context.activity.value ||
      (step.result && typeof step.result === "object")
    ) {
      if (
        step.context.activity.value.buttoninherit === "success" ||
        (step.result && step.result.buttoninherit === "success")
      ) {
        if (
          step.context.activity.value &&
          step.context.activity.value.buttoninherit === "success"
        ) {
          await step.context.sendActivity({
            attachments: [
              CardFactory.adaptiveCard(
                showFullOrderDetails(step.context.activity.value)
              ),
            ],
          });
        } else {
          await step.context.sendActivity({
            attachments: [
              CardFactory.adaptiveCard(showFullOrderDetails(step.result)),
            ],
          });
        }
      } else if (step.context.activity.value.buttoninherit === "pending") {
        await step.context.sendActivity({
          value:
            compareTime(new Date(step.context.activity.value.exdate)) === 1
              ? step.context.activity.value.paymentlink
              : "",
          attachments: [
            CardFactory.adaptiveCard(
              showFullPendingDetails(step.context.activity.value)
            ),
          ],
        });
      } else if (step.context.activity.value.buttoninherit === "cancel") {
        await step.context.sendActivity({
          attachments: [
            CardFactory.adaptiveCard(
              cancelOrderFullDetails(step.context.activity.value)
            ),
          ],
        });
      }
    }
    return Dialog.EndOfTurn;
  }
  async askForConfirmation(step) {
    console.log(step.context.activity.value);
    if (
      step.context.activity.value &&
      step.context.activity.value.from === "success"
    ) {
      if (step.context.activity.value.to === "cancelorder") {
        step.values.cancelorder = step.context.activity.value;
        await step.prompt(CONFIRM_PROMPT, "Are you sure to cancel this order", [
          "Yes",
          "No",
        ]);
      }
    } else if (
      step.context.activity.value &&
      step.context.activity.value.from === "pending" &&
      step.context.activity.value.to === "relive_pending" &&
      step.options.order
    ) {
      if (step.context.activity.value.type === "orders") {
        return await step.replaceDialog(Constant.dialogIds.cartDialogId, {
          ...step.options,
          orders: Object.values(step.context.activity.value.items),
          orderid: step.context.activity.value.orderid,
        });
      } else {
        return await step.replaceDialog(Constant.dialogIds.orderProcessing, {
          logindetails: step.options,
          mealsDetails: step.context.activity.value.items,
          quantity: step.context.activity.value.quantity,
          orderid: step.context.activity.value.orderid,
        });
      }
    } else if (
      step.context.activity.value &&
      step.context.activity.value.from === "cancel" &&
      step.context.activity.value.to === "relive_cancel"
    ) {
      if (step.context.activity.value.type === "orders") {
        return await step.replaceDialog(Constant.dialogIds.cartDialogId, {
          ...step.options,
          orders: Object.values(step.context.activity.value.items),
          orderid: step.context.activity.value.orderid,
        });
      } else {
        return await step.replaceDialog(Constant.dialogIds.orderProcessing, {
          logindetails: step.options,
          mealsDetails: step.context.activity.value.items,
          quantity: step.context.activity.value.quantity,
          orderid: step.context.activity.value.orderid,
        });
      }
    } else {
      return step.replaceDialog(Constant.dialogIds.rootDialogID);
    }
    return Dialog.EndOfTurn;
  }
  async switchDialog(step) {
    if (step.result && step.values.cancelorder) {
      const refundID = "RF_" + nanoid(5);
      //${step.context.activity.value.amount}
      const refund = await createRefund(
        {
          refund_amount: 1,
          refund_id: refundID,
        },
        step.values.cancelorder.order_id
      );
      if (refund) {
        await step.context.sendActivity(
          `Your Order is Successfully Cancelled for order #${step.values.cancelorder.order_id}`
        );
        await updateOrder(step.options.uid, step.values.cancelorder.order_id, {
          order_payment_status: "CANCELED",
          refund_id: refund.refund_id,
          canceled_at: refund.created_at,
          cancel_processed_at: refund.processed_at,
        });
        ejs.renderFile(
          resolve(__dirname, "..", "..", "views/email/cancellation.ejs"),
          {
            orderid: step.values.cancelorder.order_id,
            name: step.options.name,
            torder: step.values.cancelorder.torder,
            tamount: step.values.cancelorder.amount,
            ramount: step.values.cancelorder.amount,
            rstatus: refund.status_description,
            cdate: getDate(new Date(refund.processed_at)),
            ctime: getFullTime(new Date(refund.processed_at)).toUpperCase(),
          },
          (err, data) => {
            if (!err) {
              sendMail(
                `Your order #${step.values.cancelorder.order_id} is cancelled successfully`,
                data,
                step.options.email
              );
            } else {
              console.log(err);
            }
          }
        );
        return await step.replaceDialog(Constant.dialogIds.rootDialogID);
      } else {
        await step.context.sendActivity(
          `Hi ${step.options.name}, Now we are unable to Cancel your order please try again`
        );
        return await step.replaceDialog(this.id, step.options);
      }
    } else {
      return await step.replaceDialog(Constant.dialogIds.rootDialogID);
    }
    return Dialog.EndOfTurn;
  }
}
module.exports.MyOrders = MyOrders;
