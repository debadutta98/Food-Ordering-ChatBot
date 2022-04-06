const {
  ComponentDialog,
  WaterfallDialog,
  Dialog,
} = require("botbuilder-dialogs");
const { Constant } = require("../../helper/Constant");
const { createOrder } = require("../../api/payment");
const { customAlphabet } = require("nanoid");
const {
  getDate,
  getFullTime,
  createOrderDetails,
} = require("../../helper/utility");
const { addnewOrder, getOrderDetails } = require("../../db/Curd");
const { CardFactory } = require("botbuilder");
const { ActionTypes, ActivityTypes } = require("botbuilder-core");
const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10);
const { MyOrders } = require("../MyOrders");
class Payment extends ComponentDialog {
  constructor(userState, conversationState) {
    super(Constant.dialogIds.paymentDialogId);
    this.userState = userState;
    this.conversationState = conversationState;
    this.conversationData =
      this.conversationState.createProperty("PAYMENT_FLOW");
    this.addDialog(
      new WaterfallDialog(Constant.dialogIds.paymentDialogId, [
        this.createOrder.bind(this),
        this.sendPaymentOptions.bind(this),
        this.processPayment.bind(this),
      ])
    );
    this.initialDialogId = Constant.dialogIds.paymentDialogId;
  }
  async createOrder(step) {
    const dataflow = await this.conversationData.get(step.context, {
      ordercreation: 0,
    });
    dataflow.ordercreation += 1;
    let date = getDate();
    let time = getFullTime();
    const orderid = nanoid(7);
    step.values.oid = orderid;
    const create_order = {
      order_id: orderid,
      order_amount: Number.parseInt(step.options.amount),
      order_currency: "INR",
      customer_details: {
        customer_id: step.options.logindetails.uid,
        customer_email: step.options.logindetails.email,
        customer_phone: step.options.logindetails.phone,
      },
      order_expiry_time: new Date(new Date().setDate(new Date().getDate() + 2)),
      order_note: `This order of amount ${step.options.amount} is create by ${step.options.logindetails.name} on ${date} at ${time}`,
      order_tags: {
        order_creation_date: date,
        order_creation_time: time,
        order_delivery_location: step.options.address,
        customer_name: step.options.logindetails.name,
      },
      order_meta: {
        payment_methods: "upi,cc,dc,ccc,ppc,paypal,app",
        notify_url: `${process.env.PAYMENT_GATEWAY_NOTIFY_LINK}/payment/${step.options.logindetails.uid}/${orderid}`,
      },
    };
    const createdOrder = await createOrder(create_order);
    if (createOrder) {
      step.values.paymentdetails = {
        order_id: createdOrder.order_id,
        order_token: createdOrder.order_token,
        payment_link: createdOrder.payment_link,
      };
      return await step.next(createdOrder);
    } else {
      return await step.next(false);
    }
  }
  async sendPaymentOptions(step) {
    const dataflow = await this.conversationData.get(step.context);
    if (step.result) {
      const orderdetails = createOrderDetails(
        step.result,
        step.options.address,
        {
          items: step.options.items,
          quantity: step.options.quantity,
          type: step.options.type,
        }
      );
      const isAdded = await addnewOrder(
        step.options.logindetails.uid,
        step.values.paymentdetails.order_id,
        orderdetails
      );
      if (isAdded) {
        await step.context.sendActivity({
          value: step.values.paymentdetails.payment_link,
          attachments: [
            CardFactory.heroCard(
              "Your Order is Ready",
              CardFactory.images([
                "https://img.icons8.com/external-filled-outline-wichaiwi/344/external-pay-new-normal-after-covid-19-filled-outline-wichaiwi.png",
              ]),
              CardFactory.actions([
                {
                  type: ActionTypes.OpenUrl,
                  title: `₹${step.options.amount}/- Pay`,
                  value: step.values.paymentdetails.payment_link,
                },
              ]),
              {
                subtitle: `Please click this button to pay total amount of ₹${step.options.amount}/- for your current order`,
              }
            ),
          ],
        });
      } else {
        await step.context.sendActivity(
          "Sorry we couldn't able to save your details please try again"
        );
      }
    } else if (!step.result && dataflow.ordercreation < 2) {
      return await step.replaceDialog(this.id, step.options);
    } else {
      await step.context.sendActivity(
        "We are unable to create your order please try again"
      );
      return await step.replaceDialog(Constant.dialogIds.rootDialogID);
    }
    return Dialog.EndOfTurn;
  }
  async processPayment(step) {
    if (step.context.activity.value.status === "ok") {
      const orderdetails = await getOrderDetails(
        step.options.logindetails.uid,
        step.context.activity.value.orderid
      );
      if (orderdetails) {
        const order = {
          ordersdetails: orderdetails.order_details,
          quantity: orderdetails.order_quantity,
          orderid: step.context.activity.value.orderid,
          address: orderdetails.address,
          ordertype: orderdetails.order_type,
          buttoninherit: "success",
          amount: orderdetails.order_amount,
          paymentDate: orderdetails.order_payment_time,
        };
        return await step.replaceDialog(Constant.dialogIds.myorderDialogId, {
          ...step.options.logindetails,
          order,
        });
      } else {
        return await step.replaceDialog(Constant.dialogIds.rootDialogID);
      }
    } else {
      return await step.replaceDialog(Constant.dialogIds.rootDialogID);
    }
  }
}
module.exports.Payment = Payment;
