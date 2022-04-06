const { getDate, getFullTime } = require("../../helper/utility");

exports.successfulOrders = (orderlist) => {
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
                    text: "Successful Order Details",
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
        items: orderlist.map(([key, value]) => {
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
                            title: "Payment Date",
                            value: getDate(new Date(value.order_payment_time)),
                          },
                          {
                            title: "Payment Time",
                            value: getFullTime(
                              new Date(value.order_payment_time)
                            ).toUpperCase(),
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
                        text: "show details",
                        wrap: true,
                        size: "Small",
                        color: "Accent",
                        weight: "Lighter",
                        spacing: "Small",
                        horizontalAlignment: "Center",
                      },
                    ],
                    verticalContentAlignment: "Center",
                    horizontalAlignment: "Center",
                    selectAction: {
                      type: "Action.Submit",
                      data: {
                        ordersdetails: value.order_details,
                        orderid: key,
                        address: value.address,
                        ordertype: value.order_type,
                        buttoninherit: "success",
                        amount: value.order_amount,
                        quantity: value.order_quantity,
                        paymentDate: value.order_payment_time,
                      },
                    },
                  },
                ],
              },
              {
                type: "TextBlock",
                wrap: true,
                text: `This order is successfully ordered by you on ${getDate(
                  new Date(value.order_payment_time)
                )} at ${getFullTime(
                  new Date(value.order_payment_time)
                ).toUpperCase()}`,
                size: "Small",
                horizontalAlignment: "Center",
                isSubtle: true,
                color: "Good",
                weight: "Default",
                spacing: "Small",
              },
            ],
          };
        }),
        separator: true,
      },
    ],
  };
};
