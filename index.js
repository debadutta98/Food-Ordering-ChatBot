// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const express = require("express");
const moment = require("moment");
const app = express();
const ejs = require("ejs");
const http = require("http");
const https = require("https");
const bodyparser = require("body-parser");
const logger = require("logger").createLogger("./logger/development.log");
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");
const axios = require("axios").default;
require("dotenv").config();
const staticdata = require("./extra/review-card.json");
// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const {
  BotFrameworkAdapter,
  MemoryStorage,
  UserState,
  ConversationState,
  TurnContext,
  ActivityTypes,
} = require("botbuilder");

// This bot's main dialog.
const { FoodBot } = require("./bot");
const { RootDialog } = require("./dialogs/RootDialog");
const {
  addAddressDetails,
  getConversationReferenceId,
  updateOrder,
  findUser,
  getOrderDetails,
  findSuccessfulOrdersForReviews,
  updateOrderReviewsByUser,
  getAllReviewForFood,
  addconversationId,
} = require("./db/Curd");
const { store, getLoginInfo } = require("./helper/Context");
const { auth } = require("express-openid-connect");
const cookieParser = require("cookie-parser");
const { sendMail } = require("./api/sendMail");
const { createCol, getDate, getFullTime } = require("./helper/utility");
const { getMealById } = require("./api/mealCategories");
const { getUserInfo, getAccessToken } = require("./api/userInfo");
// Create HTTP server
app.use(bodyparser.json());
app.use(express.static(__dirname + "/public"));
app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);
app.use(
  auth({
    authRequired: false,
    idpLogout: true,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    secret: "dsdsadasdi854u659qndjndascjsdcb84",
    clientSecret: process.env.SECRET,
    authorizationParams: {
      response_type: "code id_token",
    },
    routes: {
      postLogoutRedirect: "/logingout",
    },
  })
);
app.use(cookieParser(process.env.SECRET));
app.set("view engine", "ejs");
app.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(
    `\n${app.name} listening to http://localhost:${
      process.env.port || process.env.PORT || 3978
    }`
  );
});
const maxTotalSockets = (
  preallocatedSnatPorts,
  procCount = 1,
  weight = 0.5,
  overcommit = 1.1
) =>
  Math.min(
    Math.floor((preallocatedSnatPorts / procCount) * weight * overcommit),
    preallocatedSnatPorts
  );
// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword,
  clientOptions: {
    agentSettings: {
      http: new http.Agent({
        keepAlive: true,
        maxTotalSockets: maxTotalSockets(1024, 4, 0.3),
      }),
      https: new https.Agent({
        keepAlive: true,
        maxTotalSockets: maxTotalSockets(1024, 4, 0.7),
      }),
    },
  },
});
// adapter.use(new ShowTypingMiddleware("3000", "4000"));
// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights.
  logger.info("catch-error", error, "now!");
  // Send a trace activity, which will be displayed in Bot Framework Emulator
  await context.sendTraceActivity(
    "OnTurnError Trace",
    `${error}`,
    "https://www.botframework.com/schemas/error",
    "TurnError"
  );

  // Send a message to the user
  await context.sendActivity(
    "Request Error Please Write 'Hi' To Initiate The Chat Again"
  );
};
const memoryStorage = new MemoryStorage();
const userState = new UserState(memoryStorage);
const conversationState = new ConversationState(memoryStorage);
const rootDialog = new RootDialog(userState, conversationState);
const conversationReferences = {};
// Create the main dialog.
const myBot = new FoodBot(
  userState,
  conversationState,
  rootDialog,
  conversationReferences
);
// Listen for incoming requests.

app.post("/api/messages", async (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    await myBot.run(context);
  });
});
app.get("/auth/:refId", async (req, res) => {
  let reference = myBot.conversationReferences[req.params.refId];
  if (!getLoginInfo(req.params.refId) && reference) {
    let loginformation = await getUserInfo(req.oidc.user.sub);
    if (loginformation) {
      store.dispatch({
        type: "UPDATE_LOGIN_INFO",
        convId: JSON.parse(decodeURIComponent(req.cookies.chattoken))
          .conversationId,
        logininfo: {
          user_id: req.oidc.user.sub.split("|")[1],
          email: req.oidc.user.email,
          profile_img: req.oidc.user.picture,
          name:
            req.oidc.user.sub.split("|")[1] === "google-oauth2"
              ? req.oidc.user.name
              : req.oidc.user.nickname,
          phone: loginformation.user_metadata.phone,
        },
      });
      await adapter.continueConversation(reference, async (context) => {
        if (req.oidc.user.email_verified) {
          if (loginformation.logins_count === 1) {
            await addconversationId(
              req.oidc.user.sub.split("|")[1],
              req.params.refId
            );
            ejs.renderFile(
              __dirname + "/views/email/welcome.ejs",
              { message: `Welcome ${req.oidc.user.nickname}` },
              (err, data) => {
                if (!err) {
                  sendMail(
                    "You are Successfully Register",
                    data,
                    req.oidc.user.email
                  );
                } else {
                  console.log(err);
                }
              }
            );
          }
          const userdata = jwt.sign(
            {
              user_id: req.oidc.user.sub.split("|")[1],
              email: req.oidc.user.email,
              profile_img: req.oidc.user.picture,
              name: req.oidc.user.nickname,
              phone: loginformation.user_metadata.phone,
            },
            process.env.JWT_SECRET
          );
          const age = new Date().getTime() + 2 * 24 * 60 * 60 * 1000;
          try {
            res.clearCookie("authtoken");
            res.clearCookie("profile_image");
          } catch (err) {
            console.log("not found any cookies");
          }
          res.cookie("authtoken", userdata, {
            maxAge: age,
            httpOnly: true,
          });
          res.cookie(
            "profile_image",
            JSON.stringify({ profile_img: req.oidc.user.picture }),
            {
              maxAge: age,
              httpOnly: false,
            }
          );
          res.render("authCompletePage");
          await context.sendActivity({
            text: "You are successfully logedin",
            value: { code: "5987" },
          });
          await myBot.run(context);
        } else {
          await context.sendActivity(
            "Your email address is not verified please verify your email address"
          );
          store.dispatch({
            type: "DELETE_LOGIN_INFO",
            convId: JSON.parse(decodeURIComponent(req.cookies.chattoken))
              .conversationId,
          });
          res.redirect(`/login/${req.params.refId}`);
        }
      });
    } else {
      res.render("message", {
        title: "500|Internal Server Error",
        favicon: "https://cdn-icons-png.flaticon.com/512/4457/4457164.png",
        img: "https://cdn-icons-png.flaticon.com/512/595/595067.png",
        heading: "500 Internal Server Error",
      });
    }
  } else {
    if (reference) {
      if (getLoginInfo(req.params.refId)) {
        await adapter.continueConversation(reference, async (context) => {
          await context.sendActivity("Logout Before Login");
        });
        res.render("message", {
          title: "You are already loggedin",
          favicon: "https://img.icons8.com/fluency/344/login-rounded-right.png",
          img: "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/344/external-login-web-store-flaticons-lineal-color-flat-icons-3.png",
          heading: `Please Logout If you want to Login with other account`,
        });
      } else {
        await adapter.continueConversation(reference, async (context) => {
          await context.sendActivity(
            "Please Login After suceessful verfication"
          );
        });
      }
    } else {
      res.render("message", {
        title: "Anonymous User",
        favicon: "https://cdn-icons-png.flaticon.com/512/4457/4457164.png",
        img: "https://cdn-icons-png.flaticon.com/512/595/595067.png",
        heading:
          "This is an anonymous request by a inactive user.Please be an active user when you are make any request",
      });
    }
  }
});
app.post("/notify/bot", async (req, res) => {
  let reference = myBot.conversationReferences[req.body.convId];
  if (reference) {
    await adapter.continueConversation(reference, async (context) => {
      await context.sendActivity(req.body.message);
      res.sendStatus(201);
    });
  } else {
    res.sendStatus(404);
  }
});
app.get("/login/:id", (req, res) => {
  res.oidc.login({
    returnTo: `/auth/${req.params.id}`,
    authorizationParams: {
      acr_values: req.params.id,
    },
  });
});
app.get("/", async (req, res) => {
  res.render("index");
});
app.get("/logingout", (req, res) => {
  try {
    if (
      req.cookies.authtoken &&
      req.cookies["profile_image"] &&
      req.cookies.chattoken
    ) {
      res.clearCookie("authtoken");
      res.clearCookie("profile_image");
      res.clearCookie("appSession");
      store.dispatch({
        type: "DELETE_LOGIN_INFO",
        convId: JSON.parse(decodeURIComponent(req.cookies.chattoken))
          .conversationId,
      });
      res.render("message", {
        title: "Logout Successfully",
        favicon: "https://img.icons8.com/office/344/exit.png",
        img: "https://img.icons8.com/external-sbts2018-lineal-color-sbts2018/344/external-logout-social-media-sbts2018-lineal-color-sbts2018.png",
        heading: "Your are logout successfully",
      });
    } else {
      res.render("message", {
        title: "No Record Found",
        favicon: "https://img.icons8.com/ios/344/user-not-found.png",
        img: "https://img.icons8.com/color-glass/344/user-not-found.png",
        heading: "There is no user found for logout",
      });
    }
  } catch (error) {
    console.log(["logout error"], error);
    res.render("message", {
      title: "Internal Error",
      favicon: "https://img.icons8.com/dotty/344/error-cloud.png",
      img: "https://img.icons8.com/fluency/344/error-cloud.png",
      heading: "No Worry!! Internal Error",
    });
  }
});
app.get("/pick-location", (req, res) => {
  res.render("locationpicker");
});
app.get("/send", async (req, res) => {
  let products = [
    {
      img: "https://www.themealdb.com/images/media/meals/rqtxvr1511792990.jpg",
      price: "120",
      quantity: "2",
      name: "Summer Pistou",
    },
    {
      img: "https://www.themealdb.com/images/media/meals/rqtxvr1511792990.jpg",
      price: "120",
      quantity: "2",
      name: "Summer Pistou",
    },
  ];
  let product_items = createCol(products);
  ejs.renderFile(
    __dirname + "/views/email/products.ejs",
    { products: product_items },
    (err, data) => {
      if (!err) {
        //  console.log(data);
        res.send(data);
      } else {
        console.log(err);
      }
    }
  );
  // sendMail();
  // res.sendStatus(200);
});
app.post("/save-address", async (req, res) => {
  // Lookup previously saved conversation reference.
  const reference = myBot.conversationReferences[req.body.refId];
  // Proactively notify the user.
  if (reference) {
    await adapter.continueConversation(reference, async (context) => {
      if (req.body.uid) {
        let { latitude, longitude, single_address, address_details, type } =
          req.body;
        const isAdded = await addAddressDetails(req.body.uid, {
          latitude,
          longitude,
          single_address,
          address_details,
          type,
          default: true,
        });
        console.log(isAdded);
        // const stepContext = getCurrentDialogContext(req.body.refId);
        // stepContext.context = context;
        if (isAdded) {
          await context.sendActivity({
            type: ActivityTypes.Message,
            text: "Your address is successfully added",
            value: { code: "3001", isAdded },
          });
          // stepContext.context = context;
          // stepContext.values.single_address = single_address;
          // await address.addressConfirmation(stepContext);
        } else {
          await context.sendActivity({
            type: ActivityTypes.Message,
            text: "Sorry your address is not added successfully",
            value: { code: "3001", isAdded },
          });
          // stepContext.context = context;
          // stepContext.values.single_address = "not updated";
          // await address.addressConfirmation(stepContext);
        }
      }
    });
    res.status(200).send();
  } else {
    res.status(404).send();
  }
});
app.post(
  "/review/:orderid/:userid/:conversationid/submit",
  async (req, res) => {
    try {
      let reference = myBot.conversationReferences[req.params.conversationid];
      if (reference && req.body && Array.isArray(req.body)) {
        await adapter.continueConversation(reference, async (context) => {
          let { name, profile_img } = getLoginInfo(context.activity.from.id);
          let isUpdated = await updateOrderReviewsByUser(
            req.params.userid,
            req.body,
            `${req.body.length > 1 ? "orders" : "order"}`,
            { name, profile_img },
            new Date().getTime()
          );
          if (isUpdated) {
            await context.sendActivity({
              value: {
                code: "4099",
                error: false,
                order_id: req.params.orderid,
                message: "Review is successfully updated",
              },
            });
            res.sendStatus(200);
          } else {
            await context.sendActivity({
              value: {
                code: "4099",
                error: true,
                order_id: req.params.orderid,
                message: "Failed to update your review",
              },
            });
            res.sendStatus(404);
          }
        });
      } else {
        res.sendStatus(404);
      }
    } catch (err) {
      res.sendStatus(400);
    }
  }
);
app.get("/review/:orderid/:userid/:conversationid", async (req, res) => {
  if (req.params.orderid && req.params.userid && req.params.conversationid) {
    let allorders = await findSuccessfulOrdersForReviews(req.params.userid);
    const reference = myBot.conversationReferences[req.params.conversationid];
    if (allorders && Array.isArray(allorders) && reference) {
      let order = allorders.filter(
        (value) => value.order_id === req.params.orderid
      );
      if (order.length > 0) {
        res.render("review", { order: order[0] });
      } else {
        adapter.continueConversation(reference, async (context) => {
          await context.sendActivity({ value: { message: "enable typer" } });
        });
        res.render("message", {
          title: "Already submitted Review",
          favicon: "https://img.icons8.com/windows/344/submit-for-approval.png",
          img: "https://cdn-icons-png.flaticon.com/512/7110/7110010.png",
          heading: "You are already submit the review about this Order",
        });
      }
    } else {
      if (reference) {
        adapter.continueConversation(reference, async (context) => {
          await context.sendActivity({
            value: { message: "enable typer" },
          });
        });
      }
      res.render("message", {
        title: "Anonymous User",
        favicon: "https://cdn-icons-png.flaticon.com/512/4457/4457164.png",
        img: "https://cdn-icons-png.flaticon.com/512/595/595067.png",
        heading:
          "This is an anonymous request by a inactive user.Please be an active user when you are make any request",
      });
    }
  }
});
app.get("/product/review/:mealid/:userid/:conversationid", async (req, res) => {
  try {
    let reference = myBot.conversationReferences[req.params.conversationid];
    if (reference) {
      let food = await getMealById(req.params.mealid);
      if (food) {
        let allReviews = await getAllReviewForFood(req.params.mealid);
        if (allReviews) {
          let ratings = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          Object.values(allReviews).forEach((value) => {
            ++ratings[+value["review"]["rate"]];
          });
          let overalRating =
            (5 * ratings[5] +
              4 * ratings[4] +
              3 * ratings[3] +
              2 * ratings[2] +
              1 * ratings[1]) /
            (ratings[5] + ratings[4] + ratings[3] + ratings[2] + ratings[1]);
          let reactions = {};
          Object.entries(allReviews).forEach(([reviewid, value]) => {
            if (value.dislike && value.dislike.dislikeduser) {
              let findUser = Object.values(value.dislike.dislikeduser).find(
                (value1) => value1.uid === req.params.userid
              );
              if (findUser) {
                reactions[reviewid] = "dislike";
              }
            } else if (value.like && value.like.likeduser) {
              let findUser = Object.values(value.like.likeduser).find(
                (value1) => value1.uid === req.params.userid
              );
              if (findUser) {
                reactions[reviewid] = "like";
              }
            }
          });
          res.render("showFoodReview", {
            reviews: Object.values(allReviews),
            reviewIds: Object.keys(allReviews),
            overalRating,
            ratings,
            moment,
            food_img: food.strMealThumb,
            food_name: food.strMeal,
            mealid: req.params.mealid,
            uid: req.params.userid,
            reactions,
          });
        } else {
          res.render("message", {
            title: "No Result",
            favicon: "https://cdn-icons-png.flaticon.com/512/4457/4457164.png",
            img: "https://img.icons8.com/external-smashingstocks-flat-smashing-stocks/344/external-search-results-online-marketing-and-advertising-smashingstocks-flat-smashing-stocks.png",
            heading: `No Result for review`,
          });
        }
      } else {
        res.render("message", {
          title: "No Result",
          favicon: "https://cdn-icons-png.flaticon.com/512/4457/4457164.png",
          img: "https://img.icons8.com/fluency/344/about-us-female.png",
          heading: `Wrong EndPoint`,
        });
      }
    } else {
      res.render("message", {
        title: "Anonymous User",
        favicon: "https://cdn-icons-png.flaticon.com/512/4457/4457164.png",
        img: "https://cdn-icons-png.flaticon.com/512/595/595067.png",
        heading:
          "This is an anonymous request by a inactive user.Please be an active user when you are make any request",
      });
    }
  } catch (err) {
    console.log(err);
    res.render("message", {
      title: "Internal Error",
      favicon: "https://cdn-icons-png.flaticon.com/512/4457/4457164.png",
      img: "https://cdn-icons-png.flaticon.com/512/595/595067.png",
      heading: "500|Internal Error",
    });
  }
});

app.post("/payment/:uid/:oid", async (req, res) => {
  let convid = await getConversationReferenceId(req.params.uid);
  if (req.body.data && req.body.type === "PAYMENT_SUCCESS_WEBHOOK") {
    await updateOrder(req.params.uid, req.params.oid, {
      order_payment_status: req.body.data.payment.payment_status,
      order_payment_method: req.body.data.payment.payment_group,
      order_payment_time: req.body.data.payment.payment_time,
      order_status: "INACTIVE",
    });
    try {
      let order = await getOrderDetails(req.params.uid, req.params.oid);
      if (order && order.order_quantity === 1) {
        let products = [
          {
            img: order.order_details.mealimage,
            price: order.order_details.sellingprice,
            quantity: order.order_quantity,
            name: order.order_details.mealname,
          },
        ];
        let product_items = createCol(products);
        const date = new Date(req.body.event_time);
        ejs.renderFile(
          __dirname + "/views/email/products.ejs",
          {
            products: product_items,
            name: req.body.data.order.order_tags.customer_name,
            quantity: order.order_quantity,
            price: req.body.data.payment.payment_amount,
            payment_method: req.body.data.payment.payment_group,
            address: req.body.data.order.order_tags.order_delivery_location,
            date: getDate(date),
            time: getFullTime(
              new Date(date.setMinutes(date.getMinutes() + 30))
            ),
          },
          (err, data) => {
            if (!err) {
              sendMail(
                `Your Payment for Order ${req.params.oid} is Successful`,
                data,
                req.body.data.customer_details.customer_email
              );
            } else {
              console.log(err);
            }
          }
        );
      } else if (order) {
        let products = Object.values(order.order_details).map((value) => {
          return {
            img: value.mealimage,
            price: value.sellingprice,
            quantity: value.quantity,
            name: value.mealname,
          };
        });
        const date = new Date(req.body.event_time);
        let product_items = createCol(products);
        ejs.renderFile(
          __dirname + "/views/email/products.ejs",
          {
            products: product_items,
            name: req.body.data.order.order_tags.customer_name,
            quantity: order.order_quantity,
            price: req.body.data.payment.payment_amount,
            payment_method: req.body.data.payment.payment_group,
            address: req.body.data.order.order_tags.order_delivery_location,
            date: getDate(date),
            time: getFullTime(
              new Date(date.setMinutes(date.getMinutes() + 30))
            ),
          },
          (err, data) => {
            if (!err) {
              sendMail(
                `Your Payment for Order ${req.params.oid} is Successful`,
                data,
                req.body.data.customer_details.customer_email
              );
            } else {
              console.log(err);
            }
          }
        );
      }
    } catch (err) {
      console.log(err);
    }
    let reference = myBot.conversationReferences[convid];
    if (reference) {
      adapter.continueConversation(reference, async (context) => {
        await context.sendActivity({
          type: ActivityTypes.Message,
          text: `Your payment for order of order Id ${req.body.data.order.order_id} of amount ${req.body.data.order.order_amount}/- is made successfully`,
          value: { code: "3010", status: "ok", orderid: req.params.oid },
        });
      });
    }
  } else {
    let reference = myBot.conversationReferences[convid];
    if (reference) {
      adapter.continueConversation(reference, async (context) => {
        await context.sendActivity({
          text: `Sorry your transcation for order of order Id ${req.params.oid} is unsuccessful please try again`,
          value: { code: "3010", status: "notok", orderid: "" },
          type: ActivityTypes.Message,
        });
      });
    }
  }
  res.sendStatus(200);
});

app.post("/createtoken", async (req, res) => {
  const userid = "dl_cf9bcb3b-4434-4b0f-8117-2e95db85ff9d" || `dl_${nanoid()}`;
  await axios({
    url: "https://directline.botframework.com/v3/directline/tokens/generate",
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DIRECT_LINE}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
    body: JSON.stringify({
      user: {
        id: userid,
        name: "You",
      },
    }),
  })
    .then((response) => {
      if (response.status < 300) {
        if (req.cookies.authtoken) {
          let userinfo = jwt.verify(
            req.cookies.authtoken,
            process.env.JWT_SECRET
          );
          store.dispatch({
            type: "UPDATE_LOGIN_INFO",
            logininfo: userinfo,
            convId: response.data.conversationId,
          });
          res.status(201).send({ ...response.data, name: userinfo.name });
        } else {
          res.status(201).send({ ...response.data, name: "You" });
        }
      } else {
        res.status(404).send({ message: "invalid request" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "unexpected error" });
    });
});

app.get("*", (req, res) => {
  res.render("message", {
    title: "404|Not Found",
    favicon: "https://cdn-icons-png.flaticon.com/512/4457/4457164.png",
    img: "https://cdn-icons-png.flaticon.com/512/595/595067.png",
    heading: "404 Not Found",
  });
});
