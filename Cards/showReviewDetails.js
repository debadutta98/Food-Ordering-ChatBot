const moment = require("moment");

exports.showReviewDetails = (uid, allorders, convid) => {
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
                    text: "Recent Orders",
                    wrap: true,
                    color: "Dark",
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
        items: allorders.map((value, index) => {
          return {
            type: "ColumnSet",
            columns: [
              {
                type: "Column",
                width: "stretch",
                items:
                  value.order_type === "orders"
                    ? [
                        {
                          type: "RichTextBlock",
                          id: "seemore_" + index,
                          isVisible: true,
                          inlines: [
                            {
                              type: "TextRun",
                              text: `These items are successfully purchased by you on date ${moment(
                                value.date
                              ).format("DD-MM-YYYY")} at ${moment(
                                value.date
                              ).format("hh:mm a")}.It includes..`,
                            },
                            {
                              type: "TextRun",
                              text: " +see more",
                              color: "Accent",
                              weight: "Bolder",
                            },
                          ],
                        },
                        {
                          type: "RichTextBlock",
                          isVisible: false,
                          id: "seeless_" + index,
                          inlines: [
                            {
                              type: "TextRun",
                              text: `These items are successfully purchased by you on date ${moment(
                                value.date
                              ).format("DD-MM-YYYY")} at ${moment(
                                value.date
                              ).format(
                                "hh:mm a"
                              )}.It includes ${value.product_details
                                .map((val) => {
                                  return `${val.meals_details.quantity} ${
                                    val.meals_details.quantity > 1
                                      ? "quantities"
                                      : "quantity"
                                  } of ${
                                    val.meals_details.mealname
                                  } at a price of ₹${
                                    val.meals_details.sellingprice
                                  }/-`;
                                })
                                .join(",")}.`,
                            },
                            {
                              type: "TextRun",
                              text: " -see less",
                              color: "Accent",
                              weight: "Bolder",
                            },
                          ],
                        },
                      ]
                    : [
                        {
                          type: "RichTextBlock",
                          inlines: [
                            {
                              type: "TextRun",
                              text: `This item is successfully ordered by you on date ${moment(
                                value.date
                              ).format("DD-MM-YYYY")} at ${moment(
                                value.date
                              ).format("hh:mm a")} and include ${
                                value.product_details.quantity
                              } ${
                                value.product_details.quantity > 1
                                  ? "quantities"
                                  : "quantity"
                              } of ${value.mealname} at price ₹${
                                value.product_details.sellingprice
                              }/-`,
                            },
                          ],
                        },
                      ],
                selectAction: {
                  type: "Action.ToggleVisibility",
                  targetElements:
                    value.order_type === "orders"
                      ? ["seemore_" + index, "seeless_" + index]
                      : [],
                },
              },
              {
                type: "Column",
                width: "auto",
                items: [
                  {
                    type: "Image",
                    url: "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/344/external-review-customer-feedback-flaticons-lineal-color-flat-icons.png",
                    size: "Small",
                    horizontalAlignment: "Center",
                  },
                ],
                selectAction: {
                  type: "Action.Submit",
                  data: {
                    button: "submit_review",
                    reviewlink: `${process.env.BASE_URL}/review/${value.order_id}/${uid}/${convid}`,
                  },
                },
              },
            ],
          };
        }),
      },
    ],
  };
};
