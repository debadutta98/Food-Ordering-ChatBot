const { Constant } = require("../helper/Constant");

exports.deleteAddress = (addresslist) => {
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
                    text: "Address Details",
                    wrap: true,
                    weight: "Bolder",
                    size: "Medium",
                  },
                  {
                    type: "TextBlock",
                    text: "Select a Address from the list",
                    wrap: true,
                    size: "Small",
                    isSubtle: true,
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
        items: Object.keys(addresslist).map((value, index) => {
          return {
            type: "Container",
            separator: true,
            horizontalAlignment: "Left",
            verticalContentAlignment: "Center",
            style: "emphasis",
            items: [
              {
                type: "ColumnSet",
                columns: [
                  {
                    type: "Column",
                    width: 50,
                    items: [
                      {
                        type: "Input.Toggle",
                        id: "placeid" + index,
                        valueOn: value,
                        wrap: true,
                        title: addresslist[value].single_address,
                      },
                    ],
                  },
                  {
                    type: "Column",
                    width: "stretch",
                    items: [
                      {
                        type: "Image",
                        url: Constant.images.address_type_icon[
                          addresslist[value].type.toLowerCase()
                        ],
                        size: "Small",
                      },
                      {
                        type: "TextBlock",
                        text: addresslist[value].type,
                        wrap: true,
                        horizontalAlignment: "Center",
                        isSubtle: true,
                        size: "Small",
                        spacing: "None",
                        color: "Accent",
                      },
                    ],
                  },
                ],
              },
            ],
          };
        }),
      },
      {
        type: "ActionSet",
        actions: [
          {
            type: "Action.Submit",
            title: "Delete",
            data: { button: "deleteaddress" },
            iconUrl: "https://img.icons8.com/color-glass/344/filled-trash.png",
            associatedInputs: "auto",
          },
        ],
      },
    ],
  };
};
