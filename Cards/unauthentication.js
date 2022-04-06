exports.singin = (convId) => {
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
            url: "https://thumbs.dreamstime.com/b/chef-sitting-praying-chef-sitting-praying-162609908.jpg",
            horizontalAlignment: "Center",
            width: "201px",
            height: "217px",
          },
          {
            type: "TextBlock",
            text: "Hi! please sign in to stay in the journey with us",
            wrap: true,
            horizontalAlignment: "Center",
          },
          {
            type: "ActionSet",
            actions: [
              {
                type: "Action.OpenUrl",
                title: "Signin",
                url: `${process.env.BASE_URL}/login/${convId}`,
              },
            ],
          },
        ],
      },
    ],
  };
};
