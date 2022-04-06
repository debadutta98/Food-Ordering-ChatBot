exports.pay = (url, amount) => {
  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.3",
    body: [
      {
        type: "Container",
        items: [
          {
            type: "TextBlock",
            text: `Please click this button to pay total amount of ₹${amount}/- for your current order`,
            wrap: true,
          },
          {
            type: "ActionSet",
            actions: [
              {
                type: "Action.OpenUrl",
                title: `₹${amount}/- Pay`,
                url,
              },
            ],
          },
        ],
      },
    ],
  };
};
