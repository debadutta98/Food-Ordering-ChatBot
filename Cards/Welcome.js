const { Constant } = require("../helper/Constant");
exports.welcomeCard = (name) => {
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
            url: Constant.images.chief,
            size: "Stretch",
            width: "200px",
            height: "200px",
            altText: "image of a cartoon chief",
            horizontalAlignment: "Center",
            id: "chiefimage",
          },
          {
            type: "Container",
            items: [
              {
                type: "TextBlock",
                wrap: true,
                text: `Hi! ${name} welcome to foodie restaurants you can order food at any time from our restaurants just click get started options to enjoy our service`,
                horizontalAlignment: "Left",
              },
            ],
            separator: true,
          },
        ],
      },
      {
        type: "Container",
        items: [
          {
            type: "ActionSet",
            actions: [
              {
                type: "Action.Submit",
                title: "Let's Get Started",
                data: "Let's Get Started",
              },
            ],
          },
        ],
        separator: true,
      },
    ],
  };
};
