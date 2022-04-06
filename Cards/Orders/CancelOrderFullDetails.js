const { getDate, getFullTime } = require("../../helper/utility");

exports.cancelOrderFullDetails = (details) => {
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
        items:
          details.type === "orders"
            ? Object.values(details.orders_details).map((value) => {
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
                    },
                    {
                      type: "Column",
                      width: "stretch",
                      items: [
                        {
                          type: "TextBlock",
                          wrap: true,
                          text: value.mealname,
                          weight: "Bolder",
                        },
                        {
                          type: "Container",
                          items: [
                            {
                              type: "FactSet",
                              facts: [
                                {
                                  title: "Price:",
                                  value: `₹ ${value.sellingprice}/-`,
                                },
                                {
                                  title: "Quantity:",
                                  value: `x ${value.quantity}`,
                                },
                                {
                                  title: "Total:",
                                  value: `₹ ${
                                    value.quantity * value.sellingprice
                                  }/-`,
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                };
              })
            : [
                {
                  type: "ColumnSet",
                  columns: [
                    {
                      type: "Column",
                      width: "auto",
                      items: [
                        {
                          type: "Image",
                          url: details.orders_details.mealimage,
                          size: "Medium",
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
                          text: details.orders_details.mealname,
                          weight: "Bolder",
                        },
                        {
                          type: "Container",
                          items: [
                            {
                              type: "FactSet",
                              facts: [
                                {
                                  title: "Price:",
                                  value: `₹ ${details.orders_details.sellingprice}/-`,
                                },
                                {
                                  title: "Quantity:",
                                  value: `x ${details.quantity}`,
                                },
                                {
                                  title: "Total:",
                                  value: `₹ ${
                                    details.quantity *
                                    details.orders_details.sellingprice
                                  }/-`,
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
        separator: true,
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
                width: "80px",
                items: [
                  {
                    type: "Image",
                    url: "https://img.icons8.com/dusk/344/deliver-food.png",
                  },
                ],
              },
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "FactSet",
                    facts: [
                      {
                        title: "Sub Total:",
                        value:
                          details.type === "orders"
                            ? `₹ ${Object.values(details.orders_details)
                                .map((value) => {
                                  return value.sellingprice * value.quantity;
                                })
                                .reduce((total, num) => total + num, 0)}/-`
                            : `₹ ${
                                details.quantity *
                                details.orders_details.sellingprice
                              }/-`,
                      },
                      {
                        title: "Cancel Date:",
                        value: getDate(new Date(details.exdate)),
                      },
                      {
                        title: "Cancel Time:",
                        value: getFullTime(new Date(details.exdate)),
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
                            text: "Delivery Address:",
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
                            text: details.address,
                            wrap: true,
                          },
                        ],
                      },
                    ],
                    spacing: "None",
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
                type: "ActionSet",
                actions: [
                  {
                    type: "Action.Submit",
                    title: "Re-Order",
                    data: {
                      from: "cancel",
                      to: "relive_cancel",
                      items: details.orders_details,
                      quantity:
                        details.type === "orders"
                          ? Object.values(details.orders_details)
                              .map((value) => {
                                return value.quantity;
                              })
                              .reduce((total, num) => total + num, 0)
                          : details.quantity,
                      type: details.type,
                      amount:
                        details.type === "orders"
                          ? Object.values(details.orders_details)
                              .map((value) => {
                                return value.sellingprice * value.quantity;
                              })
                              .reduce((total, num) => total + num, 0)
                          : details.quantity *
                            details.orders_details.sellingprice,
                      address: details.address,
                      orderid: details.orderid,
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
                            title: "Not Now",
                            data: {
                              orderid: details.orderid,
                            },
                          },
                        ],
                      },
                    ],
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
