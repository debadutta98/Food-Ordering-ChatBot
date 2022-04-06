exports.sendCartDetails = (address, cartlist) => {
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
                    text: "Order Details of all items",
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
        separator: true,
        items: cartlist.map((value) => {
          return {
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
                  },
                ],
                style: "emphasis",
              },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "ColumnSet",
                    columns: [
                      {
                        type: "Column",
                        width: "auto",
                        items: [
                          {
                            type: "TextBlock",
                            text: value.mealname,
                            wrap: true,
                            weight: "Bolder",
                          },
                        ],
                        spacing: "None",
                      },
                    ],
                    spacing: "None",
                    style: "emphasis",
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
                            wrap: true,
                            text: `**Price**: ₹${
                              value.quantity * value.sellingprice
                            }/-`,
                          },
                        ],
                      },
                      {
                        type: "Column",
                        width: "stretch",
                        items: [
                          {
                            type: "TextBlock",
                            text: `**Quantity**: ${value.quantity}`,
                            wrap: true,
                            horizontalAlignment: "Right",
                          },
                        ],
                        horizontalAlignment: "Left",
                        spacing: "None",
                      },
                    ],
                    spacing: "None",
                    style: "emphasis",
                  },
                ],
                spacing: "None",
              },
            ],
            spacing: "None",
          };
        }),
        style: "emphasis",
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
                    text: "**Delivery Address**:",
                    wrap: true,
                  },
                  {
                    type: "TextBlock",
                    text: address,
                    wrap: true,
                  },
                ],
              },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "TextBlock",
                    text: `**Total Price**: ₹${cartlist
                      .map((value) => {
                        return value.quantity * value.sellingprice;
                      })
                      .reduce((total, num) => {
                        return total + num;
                      }, 0)}/-`,
                    wrap: true,
                    spacing: "None",
                  },
                  {
                    type: "TextBlock",
                    text: `**Total Quantity**: ${cartlist
                      .map((value) => {
                        return value.quantity;
                      })
                      .reduce((total, num) => {
                        return total + num;
                      }, 0)}`,
                    wrap: true,
                    spacing: "Medium",
                  },
                ],
              },
            ],
          },
        ],
        separator: true,
        style: "emphasis",
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
                      type: "orders",
                      button: "proceed",
                      items: cartlist,
                      address,
                    },
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
                  },
                ],
              },
            ],
          },
        ],
        separator: true,
        style: "emphasis",
      },
    ],
  };
};
