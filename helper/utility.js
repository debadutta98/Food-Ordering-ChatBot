const moment = require("moment");
const { meals } = require("../api/mealCategories");
const { Constant } = require("./Constant");
exports.ratings = (rate) => {
  let result = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.round(rate)) {
      result += "★";
    } else {
      result += "☆";
    }
  }
  return result;
};
exports.random = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};
exports.discount = (price, discount) => {
  return {
    discountprice: Math.round(price * (discount / 100)),
    sellingprice: Math.round((price - price * (discount / 100)) * (102 / 100)),
  };
};
/*
      2-digit 415.303
      1-digit 421.303
      3-digit 405.303
       */
exports.calHeight = (items) => {
  if (items < 10) {
    return 421.303;
  } else if (items >= 10 && items < 100) {
    return 415.303;
  } else {
    return 405.303;
  }
};

exports.getDate = (date = new Date()) => {
  let dd = "";
  let mm = "";
  let d = date.getDate();
  let m = date.getMonth();
  let yyyy = date.getFullYear();
  if (d < 10) {
    dd += "0" + d;
  } else {
    dd += d;
  }
  if (m + 1 < 10) {
    mm += "0" + (m + 1);
  } else {
    mm += m;
  }
  return `${dd}-${mm}-${yyyy}`;
};

exports.getFullTime = (date = new Date()) => {
  let darr = date.toLocaleTimeString("en-IN").split(":");
  return `${darr[0]}:${darr[1]} ${darr[2].includes("pm") ? "PM" : "AM"}`;
};
exports.createOrderDetails = (res, address, orderdetails) => {
  return {
    address,
    order_note: res.order_note,
    order_amount: res.order_amount,
    order_payment_status: "PENDING",
    order_payment_method: "unknown",
    order_payment_deadline: res.order_expiry_time,
    order_details: orderdetails.items,
    order_type: orderdetails.type,
    order_quantity: orderdetails.quantity,
    order_payment_time: "unknown",
    order_token: res.order_token,
    order_status: "ACTIVE",
    order_payment_link: res.payment_link,
  };
};
exports.createCol = (products) => {
  let length = products.length;
  let arr = [];
  let start = 0;
  while (length - 3 >= 0) {
    arr.push(products.slice(start, start + 3));
    if (start + 3 <= products.length) start += 3;
    length -= 3;
  }
  if (length !== 0 && length - 3 < 0) {
    arr.push(products.slice(start, products.length));
  }
  return arr;
};

exports.compareTime = (date1, date2 = new Date()) => {
  if (+date1 === +date2) {
    return 0;
  } else if (+date1 < +date2) {
    return -1;
  } else if (+date1 > +date2) {
    return 1;
  }
};
exports.luisDateandtime = (luisresult) => {
  if (luisresult.entities.datetime[0].type === "date") {
    return {
      result: [
        luisresult.luisResult.prediction.entities.datetimeV2[0].values[0]
          .resolution[0].value,
      ],
      type: "date",
    };
  } else if (luisresult.entities.datetime[0].type === "datetimerange") {
    // return luisresult.entities.datetime[0].timex[0]
    //   .replace(/[{()}]/g, "")
    //   .split(",", 2);
    return {
      result: [
        luisresult.luisResult.prediction.entities.datetimeV2[0].values[0]
          .resolution[0].start,
        luisresult.luisResult.prediction.entities.datetimeV2[0].values[0]
          .resolution[0].end,
      ],
      type: "datetimerange",
    };
  } else if (luisresult.entities.datetime[0].type === "daterange") {
    // return luisresult.entities.datetime[0].timex[0]
    //   .replace(/[{()}]/g, "")
    //   .split(",", 2);
    return {
      result: [
        luisresult.luisResult.prediction.entities.datetimeV2[0].values[0]
          .resolution[0].start,
        luisresult.luisResult.prediction.entities.datetimeV2[0].values[0]
          .resolution[0].end,
      ],
      type: "daterange",
    };
  } else if (luisresult.entities.datetime[0].type === "datetime") {
    return {
      result: [
        luisresult.luisResult.prediction.entities.datetimeV2[0].values[0]
          .resolution[0].value,
      ],
      type: "datetime",
    };
  } else {
    return undefined;
  }
};
exports.compareTypeOfDates = (date, order_creation_date, compareTime) => {
  if (date.type === "date") {
    return (
      compareTime(
        new Date(
          new Date(
            new Date(date.result[0]).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })
          ).toLocaleDateString()
        ),
        new Date(
          new Date(
            new Date(order_creation_date).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })
          ).toLocaleDateString()
        )
      ) === 0
    );
  } else if (date.type === "datetime") {
    return (
      compareTime(
        new Date(
          new Date(date.result[0]).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })
        ),
        new Date(
          moment(
            moment(new Date(order_creation_date)).format("YYYY-MM-DDTHH:mm")
          )
            .toString()
            .split(" ")
            .splice(0, 5)
            .join(" ")
        )
      ) === 0
    );
  } else if (date.type === "daterange") {
    return (
      compareTime(
        new Date(
          new Date(
            new Date(date.result[0]).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })
          ).toLocaleDateString()
        ),
        new Date(
          new Date(
            new Date(order_creation_date).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })
          ).toLocaleDateString()
        )
      ) >= 0 &&
      compareTime(
        new Date(
          new Date(
            new Date(date.result[1]).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })
          ).toLocaleDateString()
        ),
        new Date(
          new Date(
            new Date(order_creation_date).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })
          ).toLocaleDateString()
        )
      ) <= 1
    );
  } else if (date.type === "datetimerange") {
    return (
      compareTime(
        new Date(
          new Date(date.result[0]).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })
        ),
        new Date(
          moment(
            moment(new Date(order_creation_date)).format("YYYY-MM-DDTHH:mm")
          )
            .toString()
            .split(" ")
            .splice(0, 5)
            .join(" ")
        )
      ) >= 0 &&
      compareTime(
        new Date(
          new Date(date.result[1]).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })
        ),
        new Date(
          moment(
            moment(new Date(order_creation_date)).format("YYYY-MM-DDTHH:mm")
          )
            .toString()
            .split(" ")
            .splice(0, 5)
            .join(" ")
        )
      ) <= 1
    );
  } else {
    return false;
  }
};
exports.setPendingOrderStatus = (
  payment_deadline_date,
  compareTime,
  getDate,
  getFullTime
) => {
  if (
    new Date(payment_deadline_date).toLocaleDateString("en-IN") ===
    new Date().toLocaleDateString("en-IN")
  ) {
    `This order is going to expire today at ${getFullTime(
      new Date(payment_deadline_date)
    )} please make your decision before it gets expires`;
  } else if (compareTime(new Date(payment_deadline_date)) === 1) {
    if (
      new Date(payment_deadline_date).getDate() ===
      new Date().getDate() + 1
    ) {
      return `This order will expire tomorrow at ${getFullTime(
        new Date(payment_deadline_date)
      )} please make your decision before it gets expires`;
    } else if (
      new Date(payment_deadline_date).getDate() ===
      new Date().getDate() + 2
    ) {
      return `This order is waiting for your final decision and going to expire soon on ${getDate(
        new Date(payment_deadline_date)
      )} at ${getFullTime(
        new Date(payment_deadline_date)
      )}. Please complete your payment before it expires`;
    }
  } else {
    return "This Order is already expired";
  }
};
exports.setCanceledOrderNote = (
  canceled_date,
  compareTime,
  getDate,
  getFullTime
) => {
  if (
    compareTime(new Date(canceled_date)) === -1 &&
    new Date(canceled_date).toLocaleDateString("en-IN") ===
      new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString(
        "en-IN"
      )
  ) {
    return `This order is canceled yesterday by you at time ${getFullTime(
      new Date(canceled_date)
    )}`;
  } else if (
    new Date(canceled_date).toLocaleDateString("en-IN") ===
    new Date().toLocaleDateString("en-IN")
  ) {
    return `This order is canceled today by you at time ${getFullTime(
      new Date(canceled_date)
    )}`;
  } else {
    return `This order is canceled by you on date ${getDate(
      new Date(canceled_date)
    )} at ${getFullTime(new Date(canceled_date))}`;
  }
};
exports.getInnermostActiveDialog = (dc) => {
  let child = dc.child;

  return child ? this.getInnermostActiveDialog(child) : dc.activeDialog;
};
exports.blockLuis = (active_dialog) => {
  if (Constant.PromptIDs.includes(active_dialog.id)) {
    return false;
  } else if (
    active_dialog.id === Constant.dialogIds.addressDialogId &&
    active_dialog.state.stepIndex === 0
  ) {
    return false;
  } else if (
    active_dialog.id === Constant.dialogIds.myorderDialogId &&
    active_dialog.state.stepIndex === 0
  ) {
    return false;
  } else {
    return true;
  }
};
