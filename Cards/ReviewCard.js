exports.showReviewCard = (details) => {
  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.3",
    body: [
      {
        type: "Container",
        items: [
          {
            type: "Image",
            url: details.mealimg,
            horizontalAlignment: "Center",
            spacing: "None",
          },
          {
            type: "TextBlock",
            wrap: true,
            text: details.mealname,
            size: "Medium",
            horizontalAlignment: "Center",
          },
          {
            type: "TextBlock",
            text: details.note,
            wrap: true,
            isSubtle: true,
            spacing: "Small",
            horizontalAlignment: "Center",
          },
        ],
      },
      {
        type: "ActionSet",
        actions: [
          {
            type: "Action.ShowCard",
            card: {
              type: "AdaptiveCard",
              body: [
                {
                  type: "Container",
                  items: [
                    {
                      type: "Input.Number",
                      id: "rating",
                      placeholder: "Rate this out of 5",
                      min: 1,
                      max: 5,
                      isRequired: true,
                      errorMessage: "Please mention your ratings",
                      label: "Rating",
                    },
                    {
                      type: "Input.Text",
                      id: "title",
                      isRequired: true,
                      errorMessage: "Please mention the title of your review",
                      label: "Title",
                      placeholder: "subject of your review",
                    },
                    {
                      type: "Input.Text",
                      id: "comment",
                      placeholder: "write your comments here",
                      isMultiline: true,
                      maxLength: 100,
                      isRequired: true,
                      errorMessage: "Please write your comments",
                      label: "Comments",
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
                              type: "Action.Submit",
                              title: "Submit",
                              associatedInputs: "auto",
                              data: details.action,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            title: "Post Review",
          },
        ],
      },
    ],
  };
};
