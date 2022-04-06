const { getDate, getFullTime, compareTime } = require("../../helper/utility");

exports.showFullOrderDetails = (orders) => {
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
          orders.ordertype === "orders"
            ? Object.values(orders.ordersdetails).map((value, index) => {
                return {
                  type: "Container",
                  separator: true,
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
                    },
                  ],
                };
              })
            : [
                {
                  type: "Container",
                  separator: true,
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
                              url: orders.ordersdetails.mealimage,
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
                              text: orders.ordersdetails.mealname,
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
                                      value: `₹ ${orders.ordersdetails.sellingprice}/-`,
                                    },
                                    {
                                      title: "Quantity:",
                                      value: `x ${orders.quantity}`,
                                    },
                                    {
                                      title: "Total:",
                                      value: `₹ ${
                                        orders.quantity *
                                        orders.ordersdetails.sellingprice
                                      }`,
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
                    url: "https://img.icons8.com/office/344/checked-truck.png",
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
                          orders.ordertype === "orders"
                            ? `₹ ${Object.values(orders.ordersdetails)
                                .map(
                                  (value) => value.quantity * value.sellingprice
                                )
                                .reduce((total, num) => total + num, 0)}/-`
                            : `₹ ${
                                orders.quantity *
                                orders.ordersdetails.sellingprice
                              }/-`,
                      },
                      {
                        title: "Payment Date:",
                        value: getDate(new Date(orders.paymentDate)),
                      },
                      {
                        title: "Payment Time:",
                        value: getFullTime(
                          new Date(orders.paymentDate)
                        ).toUpperCase(),
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
                            text: orders.address,
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
                actions:
                  compareTime(
                    new Date(
                      new Date(orders.paymentDate).setMinutes(
                        new Date(orders.paymentDate).getMinutes() + 60
                      )
                    )
                  ) === 1
                    ? [
                        {
                          type: "Action.Submit",
                          title: "Cancel Order",
                          data: {
                            order_id: orders.orderid,
                            from: "success",
                            to: "cancelorder",
                            amount:
                              orders.ordertype === "orders"
                                ? Object.values(orders.ordersdetails)
                                    .map(
                                      (value) =>
                                        value.quantity * value.sellingprice
                                    )
                                    .reduce((total, num) => total + num, 0)
                                : orders.quantity *
                                  orders.ordersdetails.sellingprice,
                            torder:
                              orders.ordertype === "orders"
                                ? Object.values(orders.ordersdetails)
                                    .map((value) => value.quantity)
                                    .reduce((total, num) => total + num, 0)
                                : orders.quantity,
                          },
                        },
                      ]
                    : [],
              },
            ],
          },
          {
            type: "Column",
            width: "stretch",
            items: [
              {
                type: "ActionSet",
                actions:
                  compareTime(
                    new Date(
                      new Date(orders.paymentDate).setMinutes(
                        new Date(orders.paymentDate).getMinutes() + 60
                      )
                    )
                  ) === 1
                    ? [
                        {
                          type: "Action.Submit",
                          title: "Confirm",
                          data: "I confirm this order",
                        },
                      ]
                    : [],
              },
            ],
          },
        ],
      },
    ],
  };
};
