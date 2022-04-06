const transporter = require("nodemailer").createTransport({
  host: `smtp-mail.outlook.com`,
  port: 587,
  logger: true,
  debug: false,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
exports.sendMail = (subject, data, recepientEmail) => {
  transporter.sendMail(
    {
      to: recepientEmail,
      from: "Foodie Resturant <debadebaduttapanda.7@gmail.com>",
      subject,
      html: data,
    },
    (err, info) => {
      if (!err) {
        console.log(["info"], info);
      } else {
        console.log(err);
      }
    }
  );
};
