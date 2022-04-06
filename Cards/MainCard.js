exports.mainCard = (name, carturi) => {
  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.3",
    body: [
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
                horizontalAlignment: "Left",
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
                url: "https://img.freepik.com/free-vector/hand-drawn-food-lettering-poster-cafe-restaurant_8596-242.jpg",
                size: "Medium",
                horizontalAlignment: "Right",
              },
            ],
          },
        ],
      },
      {
        type: "Container",
        items: [
          {
            type: "Container",
            items: [
              {
                type: "TextBlock",
                text: `Hello ${name} Please Select a option`,
                wrap: true,
                weight: "Bolder",
                separator: true,
                horizontalAlignment: "Left",
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
                        type: "Image",
                        url: "https://img.icons8.com/color/344/food-bar.png",
                        size: "Small",
                        horizontalAlignment: "Center",
                      },
                    ],
                  },
                  {
                    type: "Column",
                    width: "stretch",
                    items: [
                      {
                        type: "TextBlock",
                        wrap: true,
                        text: "Meals Categories",
                        horizontalAlignment: "Center",
                        weight: "Bolder",
                        color: "Good",
                        spacing: "Small",
                      },
                    ],
                    style: "default",
                  },
                ],
              },
            ],
            separator: true,
            style: "emphasis",
            selectAction: {
              type: "Action.Submit",
              data: { select: "Meals Categories" },
            },
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
                        type: "Image",
                        url: "https://cdn-icons-png.flaticon.com/512/2714/2714078.png",
                        size: "Small",
                        horizontalAlignment: "Center",
                      },
                    ],
                  },
                  {
                    type: "Column",
                    width: "stretch",
                    items: [
                      {
                        type: "TextBlock",
                        wrap: true,
                        text: "Cuisines",
                        horizontalAlignment: "Center",
                        weight: "Bolder",
                        color: "Good",
                        spacing: "Small",
                      },
                    ],
                    style: "default",
                  },
                ],
              },
            ],
            separator: true,
            style: "emphasis",
            selectAction: {
              type: "Action.Submit",
              data: { select: "Cuisines" },
            },
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
                        type: "Image",
                        url:
                          carturi ||
                          "https://cdn-icons-png.flaticon.com/512/891/891462.png",
                        size: "Small",
                        horizontalAlignment: "Center",
                      },
                    ],
                  },
                  {
                    type: "Column",
                    width: "stretch",
                    items: [
                      {
                        type: "TextBlock",
                        wrap: true,
                        text: "Cart",
                        horizontalAlignment: "Center",
                        weight: "Bolder",
                        color: "Good",
                        spacing: "Small",
                      },
                    ],
                    style: "default",
                  },
                ],
              },
            ],
            separator: true,
            style: "emphasis",
            selectAction: {
              type: "Action.Submit",
              data: { select: "Cart" },
            },
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
                        type: "Image",
                        url: "https://cdn-icons-png.flaticon.com/512/3595/3595587.png",
                        size: "Small",
                        horizontalAlignment: "Center",
                      },
                    ],
                  },
                  {
                    type: "Column",
                    width: "stretch",
                    items: [
                      {
                        type: "TextBlock",
                        wrap: true,
                        text: "Address",
                        horizontalAlignment: "Center",
                        weight: "Bolder",
                        color: "Good",
                        spacing: "Small",
                      },
                    ],
                    style: "default",
                  },
                ],
              },
            ],
            separator: true,
            style: "emphasis",
            selectAction: {
              type: "Action.Submit",
              data: { select: "Address" },
            },
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
                        type: "Image",
                        url: "https://cdn-icons-png.flaticon.com/512/2830/2830305.png",
                        size: "Small",
                        horizontalAlignment: "Center",
                      },
                    ],
                  },
                  {
                    type: "Column",
                    width: "stretch",
                    items: [
                      {
                        type: "TextBlock",
                        wrap: true,
                        horizontalAlignment: "Center",
                        weight: "Bolder",
                        color: "Good",
                        spacing: "Small",
                        text: "My Orders",
                      },
                    ],
                    style: "default",
                  },
                ],
              },
            ],
            separator: true,
            style: "emphasis",
            selectAction: {
              type: "Action.Submit",
              data: { select: "My Orders" },
            },
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
                        type: "Image",
                        url: "https://cdn-icons-png.flaticon.com/512/2519/2519204.png",
                        size: "Small",
                        horizontalAlignment: "Center",
                      },
                    ],
                  },
                  {
                    type: "Column",
                    width: "stretch",
                    items: [
                      {
                        type: "TextBlock",
                        wrap: true,
                        horizontalAlignment: "Center",
                        weight: "Bolder",
                        color: "Good",
                        spacing: "Small",
                        text: "Reviews",
                      },
                    ],
                    style: "default",
                  },
                ],
              },
            ],
            separator: true,
            style: "emphasis",
            selectAction: {
              type: "Action.Submit",
              data: { select: "Reviews" },
            },
          },
        ],
      },
    ],
  };
};
