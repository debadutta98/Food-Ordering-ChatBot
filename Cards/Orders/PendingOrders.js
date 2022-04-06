const {
  getDate,
  getFullTime,
  setPendingOrderStatus,
  compareTime,
} = require("../../helper/utility");

exports.showPendingOrders = (orders) => {
  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.3",
    body: [
      {
        type: "Container",
        items: [
          {
            type: "ColumnSet",
            columns: [
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "Image",
                    url: "https://www.wyo.in/pub/media/mf_webp/png//pub/media/catalog/tmp/category/Foodie.webp",
                    size: "Medium",
                  },
                  {
                    type: "TextBlock",
                    text: "Pending Order Details",
                    wrap: true,
                    color: "Default",
                    weight: "Bolder",
                  },
                ],
              },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "Image",
                    url: "https://img.freepik.com/free-vector/hand-drawn-food-lettering-poster-cafe-restaurant_8596-242.jpg",
                    size: "Medium",
                    horizontalAlignment: "Right",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "Container",
        items: orders.map(([key, value]) => {
          return {
            type: "Container",
            separator: true,
            items: [
              {
                type: "ColumnSet",
                columns: [
                  {
                    type: "Column",
                    width: "auto",
                    items: [
                      {
                        type: "FactSet",
                        facts: [
                          {
                            title: "Order Quantity",
                            value: `${value.order_quantity}`,
                          },
                          {
                            title: "Order Amount",
                            value: `₹ ${value.order_amount}/-`,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "Column",
                    width: "auto",
                    items: [
                      {
                        type: "FactSet",
                        facts: [
                          {
                            title: "Creation Date",
                            value: getDate(
                              new Date(
                                new Date(value.order_payment_deadline).setDate(
                                  new Date(
                                    value.order_payment_deadline
                                  ).getDate() - 2
                                )
                              )
                            ),
                          },
                          {
                            title: "Creation Time",
                            value: getFullTime(
                              new Date(
                                new Date(value.order_payment_deadline).setDate(
                                  new Date(
                                    value.order_payment_deadline
                                  ).getDate() - 2
                                )
                              )
                            ),
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "Column",
                    width: "stretch",
                    items: [
                      {
                        type: "Image",
                        url: "https://img.icons8.com/ios-glyphs/344/visible--v2.png",
                        size: "Small",
                        width: "20px",
                        horizontalAlignment: "Center",
                      },
                      {
                        type: "TextBlock",
                        wrap: true,
                        size: "Small",
                        color: "Accent",
                        weight: "Lighter",
                        spacing: "Small",
                        horizontalAlignment: "Center",
                        text: "show details",
                      },
                    ],
                    verticalContentAlignment: "Center",
                    horizontalAlignment: "Center",
                    selectAction: {
                      type: "Action.Submit",
                      data: {
                        paymentlink: value.order_payment_link,
                        quantity: value.order_quantity,
                        amount: value.order_amount,
                        orderid: key,
                        type: value.order_type,
                        orders_details: value.order_details,
                        address: value.address,
                        exdate: value.order_payment_deadline,
                        buttoninherit: "pending",
                      },
                    },
                  },
                ],
              },
              {
                type: "TextBlock",
                wrap: true,
                text: setPendingOrderStatus(
                  value.order_payment_deadline,
                  compareTime,
                  getDate,
                  getFullTime
                ),
                size: "Small",
                horizontalAlignment: "Left",
                isSubtle: true,
                color: "Warning",
                weight: "Default",
              },
            ],
          };
        }),
        separator: true,
      },
    ],
  };
};
