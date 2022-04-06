exports.addnewAddress = (userid, conversationid) => {
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
                    text: "Add New Address",
                    wrap: true,
                    weight: "Bolder",
                    size: "Medium",
                  },
                  {
                    type: "TextBlock",
                    text: "Please Fill All the details Carefully",
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
        separator: true,
        items: [
          {
            type: "ColumnSet",
            columns: [
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "Input.Text",
                    placeholder: "Enter your street",
                    label: "Street",
                    isRequired: true,
                    errorMessage: "Please enter your street details",
                    id: "street",
                  },
                ],
              },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "Input.Text",
                    placeholder: "Enter your city",
                    isRequired: true,
                    errorMessage: "Please enter your city name",
                    id: "city",
                    label: "City",
                  },
                ],
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
            width: "stretch",
            items: [
              {
                type: "Input.Text",
                id: "State",
                label: "State",
                isRequired: true,
                placeholder: "Enter your state",
                errorMessage: "Please enter your state name",
              },
            ],
          },
          {
            type: "Column",
            width: "stretch",
            items: [
              {
                type: "Input.Text",
                id: "country",
                label: "Country",
                isRequired: true,
                errorMessage: "Please Enter Country name",
                placeholder: "Enter your country",
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
            width: "stretch",
            items: [
              {
                type: "Input.Text",
                placeholder: "Enter postal code",
                id: "postalcode",
                label: "Postal Code",
                isRequired: true,
                errorMessage: "Enter your postal code",
              },
            ],
          },
          {
            type: "Column",
            width: "stretch",
            items: [
              {
                type: "Input.ChoiceSet",
                choices: [
                  {
                    title: "home",
                    value: "home",
                  },
                  {
                    title: "work",
                    value: "work",
                  },
                  {
                    title: "other",
                    value: "other",
                  },
                ],
                id: "type",
                placeholder: "Enter address type",
                label: "Address type",
                isRequired: true,
                errorMessage: "Please enter your address",
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
            width: "stretch",
            items: [
              {
                type: "ActionSet",
                actions: [
                  {
                    type: "Action.OpenUrl",
                    title: "Pick Address",
                    iconUrl: "https://img.icons8.com/ios/344/marker--v1.png",
                    url: encodeURI(
                      `${process.env.BASE_URL}/pick-location/?uid=${userid}&refId=${conversationid}`
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
                type: "ActionSet",
                actions: [
                  {
                    type: "Action.Submit",
                    title: "Submit",
                    iconUrl:
                      "https://img.icons8.com/material-outlined/344/submit-resume.png",
                    associatedInputs: "auto",
                    data: { button: "addnewaddress" },
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
