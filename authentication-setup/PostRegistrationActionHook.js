let axios = require("axios").default;
exports.onExecutePostUserRegistration = async (event) => {
  let refid = event.transaction.acr_values[0];
  //BASE_URL-->https://b886-223-231-199-106.ngrok.io/notify/bot
  if (!event.user.email_verified) {
    await axios
      .request({
        method: "POST",
        url: event.secrets.WEB_HOOK_URL,
        data: JSON.stringify({
          convId: refid,
          message: `Please Verify your email ${event.user.email} before varification of your phone number`,
        }),
        headers: {
          "Content-type": "application/json",
        },
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    console.log("user verified");
  }
};
