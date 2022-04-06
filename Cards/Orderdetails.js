const { Constant } = require("../helper/Constant");
const { discount } = require("../helper/utility");

exports.orderDetails = (quanity, ingrediants, orderdetails, address) => {
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
                    url: Constant.images.foodie,
                    horizontalAlignment: "Left",
                    size: "Medium",
                  },
                  {
                    type: "TextBlock",
                    wrap: true,
                    text: "Order Details",
                    weight: "Bolder",
                    size: "Medium",
                  },
                ],
              },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "Image",
                    url: Constant.images.foodiequotes,
                    horizontalAlignment: "Right",
                    size: "Medium",
                  },
                ],
              },
            ],
          },
        ],
      },
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
                    type: "TextBlock",
                    text: orderdetails.mealname,
                    weight: "Bolder",
                    wrap: true,
                  },
                  {
                    type: "Image",
                    url: orderdetails.mealimage,
                  },
                ],
                verticalContentAlignment: "Center",
              },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "TextBlock",
                    text: "Ratings: ★★★★☆",
                    wrap: true,
                    isSubtle: true,
                    weight: "Bolder",
                  },
                  {
                    type: "TextBlock",
                    text: `${orderdetails.discount} % off you save ₹${orderdetails.discountprice}/-`,
                    wrap: true,
                    isSubtle: true,
                    weight: "Bolder",
                  },
                  {
                    type: "TextBlock",
                    text: `Ingredients:\\\n${ingrediants.join(", ")}`,
                    wrap: true,
                    horizontalAlignment: "Left",
                    isSubtle: true,
                    weight: "Bolder",
                  },
                ],
                verticalContentAlignment: "Center",
              },
            ],
          },
        ],
        style: "default",
      },
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
                    type: "TextBlock",
                    text: "Payment Details",
                    wrap: true,
                    weight: "Bolder",
                  },
                ],
              },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "TextBlock",
                    text: "Delivery Details",
                    wrap: true,
                    weight: "Bolder",
                  },
                ],
              },
            ],
            style: "default",
          },
          {
            type: "ColumnSet",
            columns: [
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "FactSet",
                    facts: [
                      {
                        title: "Order Quantity: ",
                        value: `${quanity}`,
                      },
                      {
                        title: "Price :",
                        value: `₹${quanity * orderdetails.originalprice}/-`,
                      },
                      {
                        title: "Discount :",
                        value: `${orderdetails.discount}%`,
                      },
                      {
                        title: "Tax : ",
                        value: "2%",
                      },
                      {
                        title: "Total :",
                        value: `₹${
                          discount(
                            quanity * orderdetails.originalprice,
                            orderdetails.discount
                          ).sellingprice
                        }/-`,
                      },
                    ],
                  },
                ],
                backgroundImage: {
                  verticalAlignment: "Center",
                },
                verticalContentAlignment: "Center",
              },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "TextBlock",
                    text: "Delivery Address :",
                    wrap: true,
                    weight: "Bolder",
                  },
                  {
                    type: "TextBlock",
                    text: address,
                    wrap: true,
                  },
                ],
                backgroundImage: {
                  verticalAlignment: "Center",
                },
                verticalContentAlignment: "Center",
              },
            ],
            style: "default",
            separator: true,
          },
        ],
        verticalContentAlignment: "Center",
      },
      {
        type: "ColumnSet",
        columns: [
          {
            type: "Column",
            width: "stretch",
            items: [
              {
                type: "ActionSet",
                actions: [
                  {
                    type: "Action.Submit",
                    title: "Proceed To Pay",
                    data: {
                      address,
                      button: "proceed",
                      type: "order",
                      items: orderdetails,
                      amount: discount(
                        quanity * orderdetails.originalprice,
                        orderdetails.discount
                      ).sellingprice,
                      address,
                    },
                    iconUrl:
                      "https://img.icons8.com/external-itim2101-blue-itim2101/344/external-pay-financial-itim2101-blue-itim2101.png",
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
                type: "ActionSet",
                actions: [
                  {
                    type: "Action.Submit",
                    title: "Cancel",
                    data: {
                      button: "cancel",
                    },
                    iconUrl:
                      "https://img.icons8.com/color/344/cancel-subscription.png",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
};
