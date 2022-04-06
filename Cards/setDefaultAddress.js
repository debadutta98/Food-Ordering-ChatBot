const { Constant } = require("../helper/Constant");

exports.setDefaultAddress = (addresslist) => {
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
                    size: "Medium",
                    horizontalAlignment: "Left",
                  },
                  {
                    type: "TextBlock",
                    text: "Current Address",
                    wrap: true,
                    weight: "Bolder",
                  },
                  {
                    type: "TextBlock",
                    text: "Please select your delivery address",
                    wrap: true,
                    isSubtle: true,
                    size: "Small",
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
        items: Object.keys(addresslist).map((value, index) => {
          return {
            type: "Container",
            items: [
              {
                type: "ColumnSet",
                columns: [
                  {
                    type: "Column",
                    width: 50,
                    items: [
                      {
                        type: "TextBlock",
                        text: addresslist[value].single_address,
                        horizontalAlignment: "Left",
                        wrap: true,
                      },
                    ],
                    horizontalAlignment: "Left",
                  },
                  {
                    type: "Column",
                    width: "52px",
                    items: [
                      {
                        type: "Image",
                        url: Constant.images.address_type_icon[
                          addresslist[value].type.toLowerCase()
                        ],
                        horizontalAlignment: "Center",
                      },
                      {
                        type: "TextBlock",
                        text: addresslist[value].type,
                        horizontalAlignment: "Center",
                        isSubtle: true,
                        color: "Accent",
                        size: "Small",
                        wrap: true,
                        spacing: "Small",
                      },
                    ],
                    horizontalAlignment: "Center",
                  },
                ],
              },
            ],
            separator: true,
            style: "emphasis",
            selectAction: {
              type: "Action.Submit",
              data: { button: "selectdefault", addressid: value },
            },
          };
        }),
        separator: true,
      },
    ],
  };
};
