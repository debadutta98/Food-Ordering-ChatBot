exports.createOrder = async (body) => {
  const sdk = require("api")("@cashfreedocs-new/v2022-01-01#2gl8m11kzfeenat");
  return await sdk
    .CreateOrder(body, {
      "x-client-id": process.env.PAYMENT_GATEWAY_ID,
      "x-client-secret": process.env.PAYMENT_GATEWAY_SECRETES,
      "x-api-version": "2022-01-01",
    })
    .then((res) => {
      if (res && res.order_id) {
        return res;
      } else {
        console.log(["error"], res);
        return false;
      }
    })
    .catch((err) => {
      console.log(["err"], err);
      return false;
    });
};
exports.createRefund = async (body, order_id) => {
  const sdk = require("api")("@cashfreedocs-new/v2#1g39jaabl03eo0k6");

  sdk.server("https://sandbox.cashfree.com/pg");
  console.log(body, order_id);
  return await sdk
    .Createrefund(body, {
      order_id,
      "x-client-id": process.env.PAYMENT_GATEWAY_ID,
      "x-client-secret": process.env.PAYMENT_GATEWAY_SECRETES,
      "x-api-version": "2022-01-01",
    })
    .then((res) => {
      console.log(["error", res]);
      if (res && res.refund_id) {
        return res;
      } else {
        return false;
      }
    })
    .catch((err) => {
      console.log(["err"], err);
      return false;
    });
};
