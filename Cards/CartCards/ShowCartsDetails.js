const { ratings } = require("../../helper/utility");

exports.cartDetailsCard = (cartItems) => {
  let body = [];
  body.push({
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
                horizontalAlignment: "Left",
              },
              {
                type: "TextBlock",
                text: "Cart Item",
                wrap: true,
                weight: "Bolder",
                size: "Medium",
                spacing: "None",
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
  });
  body.push({
    type: "Container",
    items: cartItems.map(([key, value], index) => {
      return {
        type: "Container",
        items: [
          {
            type: "ColumnSet",
            columns: [
              {
                type: "Column",
                width: "auto",
                items: [
                  {
                    type: "Image",
                    url: value.mealimage,
                    size: "Medium",
                    horizontalAlignment: "Left",
                  },
                ],
                selectAction: {
                  type: "Action.ToggleVisibility",
                  targetElements: ["toggle" + index],
                },
              },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "Container",
                    items: [
                      {
                        type: "TextBlock",
                        text: `${
                          value.discount
                        }% off on order Rating: ${ratings(4)}`,
                        wrap: true,
                        isSubtle: true,
                        weight: "Bolder",
                        color: "Default",
                      },
                      {
                        type: "Container",
                        separator: true,
                        items: [
                          {
                            type: "TextBlock",
                            wrap: true,
                            text: value.mealname,
                            weight: "Bolder",
                            size: "Medium",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "ColumnSet",
                    columns: [
                      {
                        type: "Column",
                        width: "auto",
                        items: [
                          {
                            type: "TextBlock",
                            text: `**Price of 1 quantity**: ₹${value.sellingprice}/-`,
                            wrap: true,
                            horizontalAlignment: "Left",
                          },
                        ],
                        horizontalAlignment: "Center",
                        verticalContentAlignment: "Center",
                      },
                      {
                        type: "Column",
                        width: "auto",
                        items: [
                          {
                            type: "TextBlock",
                            text: "**Quantity**: ",
                            wrap: true,
                            horizontalAlignment: "Right",
                          },
                        ],
                        verticalContentAlignment: "Center",
                        horizontalAlignment: "Center",
                      },
                      {
                        type: "Column",
                        width: "stretch",
                        items: [
                          {
                            type: "Input.Number",
                            placeholder: "Quantity",
                            value: value.quantity,
                            min: 1,
                            id: "quantity" + index,
                            spacing: "None",
                          },
                        ],
                        verticalContentAlignment: "Center",
                        minHeight: "5px",
                        spacing: "Small",
                      },
                    ],
                    horizontalAlignment: "Center",
                    spacing: "Small",
                  },
                ],
              },
            ],
          },
          {
            type: "ColumnSet",
            id: "toggle" + index,
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
                        title: "Order",
                        data: {
                          button: "order",
                          slno: index,
                          mealdetails: value,
                        },
                        iconUrl:
                          "https://cdn-icons-png.flaticon.com/512/1008/1008010.png",
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
                        title: "Remove",
                        data: {
                          id: key,
                          name: value.mealname,
                          button: "remove",
                        },
                        iconUrl:
                          "https://cdn-icons-png.flaticon.com/128/1214/1214428.png",
                      },
                    ],
                  },
                ],
              },
            ],
            isVisible: false,
          },
        ],
        separator: true,
      };
    }),
    separator: true,
  });
  body.push({
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
                title: "CheckOut",
                data: { items: cartItems, button: "checkout" },
                iconUrl: "https://img.icons8.com/ios/344/checkout.png",
                associatedInputs: "auto",
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
                title: "Not now",
                data: { button: "notnow" },
                associatedInputs: "none",
              },
            ],
          },
        ],
      },
    ],
    spacing: "Large",
  });
  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.3",
    body,
  };
};
