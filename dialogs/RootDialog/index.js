const { TurnContext, ActivityTypes, ActionTypes } = require("botbuilder");
const { CardFactory } = require("botbuilder-core");
const { LuisRecognizer, QnAMaker } = require("botbuilder-ai");
const {
  ComponentDialog,
  WaterfallDialog,
  DialogSet,
  DialogTurnStatus,
  Dialog,
} = require("botbuilder-dialogs");
const { mainCard } = require("../../Cards/MainCard");
const {
  getAllCartItem,
  filterOrdersByUserInput,
  getLatestSuccessfulOrders,
  addItemToCart,
} = require("../../db/Curd");
const { Constant } = require("../../helper/Constant");
const { getCartSvg } = require("../../helper/cartSvg");
const { Address } = require("../Address");
const { MealsCategories } = require("../MealsCategroies");
const { Cuisines } = require("../Cuisines");
const { getLoginInfo } = require("../../helper/Context");
const { Payment } = require("../Payment");
const { OrderProcess } = require("../OrderProcess");
const {
  calHeight,
  luisDateandtime,
  discount,
  random,
  ratings,
  getInnermostActiveDialog,
  blockLuis,
} = require("../../helper/utility");
const { Cart } = require("../Cart");
const { MyOrders } = require("../MyOrders");

const { singin } = require("../../Cards/unauthentication");
const { Reviews } = require("../Reviews");
const {
  getMealByName,
  searchMealsByCatagory,
  getMealsForCuisines,
} = require("../../api/mealCategories");
const luisApplication = {
  applicationId: process.env.LUISAPPId,
  endpointKey: process.env.LUISsubscriptionKey,
  endpoint: process.env.LUISendpoint,
};
const luisRecognizerOptions = {
  apiVersion: "v3",
  datetimeReference: new Date().toISOString(),
  includeAllIntents: true,
  includeAPIResults: true,
  log: true,
  slot: "staging",
};
class RootDialog extends ComponentDialog {
  constructor(userState, conversationState) {
    super(Constant.dialogIds.rootDialogID);
    this.userState = userState;
    this.conversationState = conversationState;
    this.loginData = this.userState.createProperty("ROOT_USER_DATA_PROPERTY");
    this.luisrecognizer = new LuisRecognizer(
      luisApplication,
      luisRecognizerOptions,
      true
    );
    this.addDialog(new Reviews(userState, conversationState));
    this.addDialog(new Cuisines(userState, conversationState));
    this.addDialog(new OrderProcess(userState, conversationState));
    this.addDialog(new MealsCategories(userState, conversationState));
    this.addDialog(new Address(userState, conversationState));
    this.addDialog(new Cart(userState, conversationState));
    this.addDialog(new MyOrders(userState, conversationState));
    this.addDialog(new Payment(userState, conversationState));
    this.addDialog(
      new WaterfallDialog(Constant.dialogIds.rootDialogID, [
        this.rootDialogFirstStep1.bind(this),
        this.rootDialogFirstStep2.bind(this),
      ])
    );
    this.initialDialogId = Constant.dialogIds.rootDialogID;
  }

  async run(turnContext, accessor) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);
    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
      return await dialogContext.beginDialog(this.id);
    }
  }
  async onContinueDialog(innerDc) {
    if (
      innerDc.context.activity.text &&
      !Number.isInteger(Number.parseInt(innerDc.context.activity.text)) &&
      blockLuis(getInnermostActiveDialog(innerDc))
    ) {
      const result = await this.recognizeUserInputs(innerDc);
      if (result) {
        return result;
      }
    }
    // console.log(["1"], JSON.stringify(innerDc.stack));
    return await super.onContinueDialog(innerDc);
  }

  async rootDialogFirstStep1(step) {
    const logininfo = getLoginInfo(step.context.activity.from.id);
    const login = await this.loginData.get(step.context, {
      isLogin: false,
      email: "",
      name: "",
      uid: "",
      cart: 0,
      phone: "",
      img: "",
    });
    if (!logininfo) {
      const convId = TurnContext.getConversationReference(step.context.activity)
        .conversation.id;
      await step.context.sendActivity({
        value: `${process.env.BASE_URL}/login/${convId}`,
        attachments: [CardFactory.adaptiveCard(singin(convId))],
      });
      return await step.cancelAllDialogs(true);
    } else {
      if (!login.isLogin && logininfo) {
        login.isLogin = true;
        login.email = logininfo.email;
        login.img = logininfo.profile_img;
        login.name = logininfo.name;
        login.uid = logininfo.user_id;
        login.phone = logininfo.phone;
      }
      const noOfCartItem = await getAllCartItem(login.uid);
      if (noOfCartItem.code) {
        login.cart = noOfCartItem.items;
      } else {
        login.cart = 0;
      }

      const carturi = getCartSvg(calHeight(login.cart), login.cart);
      await step.context.sendActivity({
        attachments: [
          CardFactory.adaptiveCard(
            mainCard(
              login.name,
              `data:image/svg+xml,${encodeURIComponent(carturi)}`
            )
          ),
        ],
      });
      return Dialog.EndOfTurn;
    }
  }

  async rootDialogFirstStep2(step) {
    const login = await this.loginData.get(step.context);
    if (
      login.isLogin &&
      step.context.activity &&
      step.context.activity.value &&
      step.context.activity.value.select
    ) {
      return await this.menuRedireaction(
        step,
        step.context.activity.value.select,
        login
      );
    } else {
      return Dialog.EndOfTurn;
    }
  }
  async menuRedireaction(step, menu, login) {
    /* Menus: [
    "Meals Categories",
    "Cuisines",
    "Cart",
    "Address",
    "My Orders",
    "Reviews",
  ],*/
    switch (menu) {
      case Constant.Menus[0]:
        //Meals Categroies
        return await step.beginDialog(
          Constant.dialogIds.mealsCategroiesId,
          login
        );
      case Constant.Menus[1]:
        //Cuisines
        return await step.beginDialog(
          Constant.dialogIds.cuisinesDialogId,
          login
        );
        break;
      case Constant.Menus[2]:
        //Cart
        return await step.beginDialog(Constant.dialogIds.cartDialogId, login);
        break;
      case Constant.Menus[3]:
        //Address
        return await step.beginDialog(
          Constant.dialogIds.addressDialogId,
          login
        );
        break;
      case Constant.Menus[4]:
        //My Orders
        return await step.beginDialog(
          Constant.dialogIds.myorderDialogId,
          login
        );
        break;
      case Constant.Menus[5]:
        //Reviews
        return await step.beginDialog(Constant.dialogIds.reviewDialogId, login);
        break;
      default:
        return await step.replaceDialog(this.id);
    }
  }
  async recognizeUserInputs(innerDc) {
    let luisresult = await this.luisrecognizer.recognize(innerDc.context);
    const login = await this.loginData.get(innerDc.context);
    let topintent = LuisRecognizer.topIntent(luisresult);
    console.log(["Intent"], topintent);
    console.log(JSON.stringify(luisresult));
    if (topintent === "Switch_Dialog") {
      if (luisresult.entities && Array.isArray(luisresult.entities.dialogs)) {
        if (luisresult.entities.dialogs[0][0] === "Home") {
          await innerDc.cancelAllDialogs();
          return await innerDc.beginDialog(Constant.dialogIds.rootDialogID);
        } else if (luisresult.entities.dialogs[0][0] === "Address") {
          await innerDc.cancelAllDialogs();
          return await innerDc.beginDialog(
            Constant.dialogIds.addressDialogId,
            login
          );
        } else if (luisresult.entities.dialogs[0][0] === "Cuisines") {
          await innerDc.cancelAllDialogs();
          return await innerDc.beginDialog(
            Constant.dialogIds.cuisinesDialogId,
            login
          );
        } else if (luisresult.entities.dialogs[0][0] === "Meal categorize") {
          await innerDc.cancelAllDialogs();
          return await innerDc.beginDialog(
            Constant.dialogIds.mealsCategroiesId,
            login
          );
        } else if (luisresult.entities.dialogs[0][0] === "Orders") {
          await innerDc.cancelAllDialogs();
          return await innerDc.beginDialog(
            Constant.dialogIds.myorderDialogId,
            login
          );
        } else if (luisresult.entities.dialogs[0][0] === "Reviews") {
          await innerDc.cancelAllDialogs();
          return await innerDc.beginDialog(
            Constant.dialogIds.reviewDialogId,
            login
          );
        } else if (luisresult.entities.dialogs[0][0] === "login") {
          let refId = TurnContext.getConversationReference(
            innerDc.context.activity
          ).conversation.id;
          await innerDc.cancelAllDialogs(true);
          await innerDc.context.sendActivity({
            text: "Please Login",
            value: {
              code: "5980",
              url: `${process.env.BASE_URL}/login/${refId}`,
            },
          });
        } else if (luisresult.entities.dialogs[0][0] === "logout") {
          await innerDc.cancelAllDialogs(true);
          await innerDc.context.sendActivity({
            value: {
              code: "5981",
              url: `${process.env.BASE_URL}/logout`,
            },
          });
        }
      } else {
        await innerDc.context.sendActivity(Constant.LuisErrorMessage);
        return { status: DialogTurnStatus.waiting };
      }
    } else if (topintent === "Address_modification") {
      if (luisresult.entities && Array.isArray(luisresult.entities.Address)) {
        if (luisresult.entities.Address[0][0] === "delete") {
          await innerDc.cancelAllDialogs();
          return await innerDc.beginDialog(Constant.dialogIds.addressDialogId, {
            ...login,
            operation: Constant.AddressOperations[2],
          });
        } else if (luisresult.entities.Address[0][0] === "Add") {
          await innerDc.cancelAllDialogs();
          return await innerDc.beginDialog(Constant.dialogIds.addressDialogId, {
            ...login,
            operation: Constant.AddressOperations[0],
          });
        } else if (luisresult.entities.Address[0][0] === "Change") {
          await innerDc.cancelAllDialogs();
          return await innerDc.beginDialog(Constant.dialogIds.addressDialogId, {
            ...login,
            operation: Constant.AddressOperations[3],
          });
        } else if (luisresult.entities.Address[0][0] === "get all address") {
          await innerDc.cancelAllDialogs();
          return await innerDc.beginDialog(Constant.dialogIds.addressDialogId, {
            ...login,
            operation: Constant.AddressOperations[1],
          });
        }
      } else {
        await innerDc.context.sendActivity(Constant.LuisErrorMessage);
        return { status: DialogTurnStatus.waiting };
      }
    } else if (topintent === "Show_Order_Status") {
      if (
        Array.isArray(luisresult.entities.orders_status) &&
        luisresult.entities.orders_status.length > 0 &&
        Array.isArray(luisresult.entities.datetime) &&
        luisresult.entities.datetime.length > 0
      ) {
        let datetime = luisDateandtime(luisresult);
        if (datetime) {
          let orders_status =
            luisresult.entities.orders_status[0][0] === "Successful"
              ? "SUCCESS"
              : luisresult.entities.orders_status[0][0] === "Pending"
              ? "PENDING"
              : luisresult.entities.orders_status[0][0] === "Cancel"
              ? "CANCELED"
              : false;
          if (!orders_status) {
            await innerDc.context.sendActivity(
              `${luisresult.entities.orders_status} is not a correct order status`
            );
            return { status: DialogTurnStatus.waiting };
          }
          const filter_orders = await filterOrdersByUserInput(
            login.uid,
            orders_status,
            datetime
          );
          if (filter_orders) {
            const order = {
              orders_status,
              attachments_payload: filter_orders,
            };
            await innerDc.cancelAllDialogs();
            return await innerDc.beginDialog(
              Constant.dialogIds.myorderDialogId,
              { ...login, order }
            );
          } else {
            await innerDc.context.sendActivity(
              `Sorry i did't found any ${luisresult.entities.orders_status[0][0]} order details`
            );
            return { status: DialogTurnStatus.waiting };
          }
        } else {
          await innerDc.context.sendActivity(
            "Sorry i can't recognize your text please re-enter your query again"
          );
          return { status: DialogTurnStatus.waiting };
        }
      } else if (
        Array.isArray(luisresult.entities.orders_status) &&
        luisresult.entities.orders_status.length > 0
      ) {
        let orders_status =
          luisresult.entities.orders_status[0][0] === "Successful"
            ? "SUCCESS"
            : luisresult.entities.orders_status[0][0] === "Pending"
            ? "PENDING"
            : luisresult.entities.orders_status[0][0] === "Cancel"
            ? "CANCELED"
            : false;
        if (orders_status) {
          let attachments_payload = await getLatestSuccessfulOrders(
            login.uid,
            orders_status
          );
          if (attachments_payload) {
            const order = {
              orders_status,
              attachments_payload,
            };
            await innerDc.cancelAllDialogs();
            return await innerDc.beginDialog(
              Constant.dialogIds.myorderDialogId,
              {
                ...login,
                order,
              }
            );
          } else {
            await innerDc.context.sendActivity(
              `Sorry we didn't found any ${luisresult.entities.orders_status[0][0]} order can you please mention the actual date of your order`
            );
            return { status: DialogTurnStatus.waiting };
          }
        }
      } else {
        await innerDc.context.sendActivity(Constant.LuisErrorMessage);
        return { status: DialogTurnStatus.waiting };
      }
    } else if (topintent === "Orders" && luisresult.entities.meal) {
      try {
        let listofmeals = luisresult.entities.meal
          .map((value, index) => {
            return {
              quantity: Number.isSafeInteger(Number.parseInt(value.Quantity))
                ? value.Quantity
                : `${luisresult.luisResult.prediction.entities.number[index]}`,
              mealname: value.mealname,
            };
          })
          .flat();
        console.log(listofmeals);
        if (listofmeals.length === 1) {
          let meals = await getMealByName(listofmeals[0].mealname);
          if (meals && Array.isArray(meals)) {
            let dis = random(10, 50);
            let price = random(210, 500);
            let { sellingprice, discountprice } = discount(price, dis);
            let order = {
              mealid: meals[0].idMeal,
              mealname: meals[0].strMeal,
              mealimage: meals[0].strMealThumb,
              sellingprice,
              discountprice,
              discount: dis,
              originalprice: price,
            };
            await innerDc.cancelAllDialogs();
            return await innerDc.beginDialog(
              Constant.dialogIds.orderProcessing,
              {
                logindetails: login,
                mealsDetails: order,
                quantity: listofmeals[0].quantity,
              }
            );
          } else {
            await innerDc.context.sendActivity(
              `unable to find details for ${listofmeals[0].mealname}`
            );
            return { status: DialogTurnStatus.waiting };
          }
        } else {
          let mealsrequests = listofmeals.map(async (value) => {
            return await getMealByName(value.mealname);
          });
          await Promise.allSettled(mealsrequests)
            .then(async (result) => {
              let allfooditems = result.map((value, index) => {
                let dis = random(10, 50);
                let price = random(210, 500);
                let { sellingprice, discountprice } = discount(price, dis);
                if (value.status === "fulfilled") {
                  if (Array.isArray(value.value)) {
                    return {
                      mealid: value.value[0].idMeal,
                      mealname: value.value[0].strMeal,
                      mealimage: value.value[0].strMealThumb,
                      sellingprice,
                      discountprice,
                      discount: dis,
                      quantity: +listofmeals[index].quantity,
                      originalprice: price,
                    };
                  } else {
                    return false;
                  }
                } else {
                  return false;
                }
              });
              let filter_orders = allfooditems.filter((value) => value);
              if (filter_orders.length) {
                if (filter_orders.length !== listofmeals.length) {
                  let food_list = [];
                  allfooditems.forEach((value, index) => {
                    if (!value) food_list.push(listofmeals[index].mealname);
                  });
                  await innerDc.context.sendActivity(
                    `unable to find the details for ${food_list.join(",")}`
                  );
                }
                if (filter_orders.length === 1) {
                  delete filter_orders[0]["quantity"];
                  await innerDc.cancelAllDialogs();
                  return await innerDc.beginDialog(
                    Constant.dialogIds.orderProcessing,
                    {
                      logindetails: login,
                      mealsDetails: filter_orders[0],
                      quantity:
                        listofmeals[
                          allfooditems.findIndex(
                            (value) =>
                              JSON.stringify(value) ===
                              JSON.stringify(filter_orders[0])
                          )
                        ].quantity,
                    }
                  );
                } else {
                  await innerDc.cancelAllDialogs();
                  return await innerDc.beginDialog(
                    Constant.dialogIds.cartDialogId,
                    { ...login, orders: filter_orders }
                  );
                }
              } else {
                await innerDc.context.sendActivity(
                  `Can't found any details for your current order`
                );
                return { status: DialogTurnStatus.waiting };
              }
            })
            .catch(async (err) => {
              console.log(err);
              await innerDc.context.sendActivity(
                "Sorry we have no meals that you want to order please order some thing else"
              );
              return { status: DialogTurnStatus.waiting };
            });
          return { status: DialogTurnStatus.waiting };
        }
      } catch {
        await innerDc.context.sendActivity(
          "Unable to understand your language please try again"
        );
        return { status: DialogTurnStatus.waiting };
      }
    } else if (topintent === "Cart" && luisresult.entities.meal) {
      try {
        let listofmeals = luisresult.entities.meal
          .map((value, index) => {
            return {
              quantity: Number.isSafeInteger(Number.parseInt(value.Quantity))
                ? value.Quantity
                : `${luisresult.luisResult.prediction.entities.number[index]}`,
              mealname: value.mealname,
            };
          })
          .flat();
        console.log(listofmeals);
        if (listofmeals.length === 1) {
          let meals = await getMealByName(listofmeals[0].mealname);
          if (meals && Array.isArray(meals)) {
            let dis = random(10, 50);
            let price = random(210, 500);
            let { sellingprice, discountprice } = discount(price, dis);
            let order = {
              mealid: meals[0].idMeal,
              mealname: meals[0].strMeal,
              mealimage: meals[0].strMealThumb,
              sellingprice,
              discountprice,
              discount: dis,
              originalprice: price,
            };
            const isAdded = await addItemToCart(login.uid, {
              ...order,
              quantity: +listofmeals[0].quantity,
            });
            if (isAdded) {
              await innerDc.context.sendActivity(
                `${meals[0].strMeal} is Successfully order to your cart`
              );
              return await innerDc.beginDialog(
                Constant.dialogIds.cartDialogId,
                login
              );
            } else {
              await innerDc.context.sendActivity(
                "We are unable to add the item to your cart please Try again"
              );
              return { status: DialogTurnStatus.waiting };
            }
          } else {
            await innerDc.context.sendActivity(
              `unable to find details for ${listofmeals[0].mealname}`
            );
            return { status: DialogTurnStatus.waiting };
          }
        } else {
          let mealsrequests = listofmeals.map(async (value) => {
            return await getMealByName(value.mealname);
          });
          await Promise.allSettled(mealsrequests)
            .then(async (result) => {
              let allfooditems = result.map((value, index) => {
                let dis = random(10, 50);
                let price = random(210, 500);
                let { sellingprice, discountprice } = discount(price, dis);
                if (value.status === "fulfilled") {
                  if (Array.isArray(value.value)) {
                    return {
                      mealid: value.value[0].idMeal,
                      mealname: value.value[0].strMeal,
                      mealimage: value.value[0].strMealThumb,
                      sellingprice,
                      discountprice,
                      discount: dis,
                      quantity: +listofmeals[index].quantity,
                      originalprice: price,
                    };
                  } else {
                    return false;
                  }
                } else {
                  return false;
                }
              });
              let filter_orders = allfooditems.filter((value) => value);
              if (filter_orders.length) {
                if (filter_orders.length !== listofmeals.length) {
                  let food_list = [];
                  allfooditems.forEach((value, index) => {
                    if (!value) food_list.push(listofmeals[index].mealname);
                  });
                  await innerDc.context.sendActivity(
                    `unable to find the details for ${food_list.join(",")}`
                  );
                }
                if (filter_orders.length === 1) {
                  delete filter_orders[0]["quantity"];
                  const isAdded = await addItemToCart(login.uid, {
                    ...filter_orders[0],
                    quantity: filter_orders[0].quantity,
                  });
                  if (isAdded) {
                    await innerDc.context.sendActivity(
                      `${filter_orders[0].strMeal} is Successfully order to your cart`
                    );
                    await innerDc.cancelAllDialogs();
                    return await innerDc.beginDialog(
                      Constant.dialogIds.cartDialogId,
                      login
                    );
                  } else {
                    await innerDc.context.sendActivity(
                      "We are unable to add the item to your cart please Try again"
                    );
                    return { status: DialogTurnStatus.waiting };
                  }
                } else {
                  const addtocartrequest = filter_orders.map(async (value) => {
                    let quantity = value.quantity;
                    delete value["quantity"];
                    return await addItemToCart(login.uid, {
                      ...value,
                      quantity,
                    });
                  });
                  await Promise.allSettled(addtocartrequest).then(
                    async (result) => {
                      let foodlist = result
                        .map((value, index) => {
                          if (value.status === "fulfilled" && value.value) {
                            return filter_orders[index].mealname;
                          }
                        })
                        .filter((value) => value)
                        .join(",");
                      await innerDc.context.sendActivity(
                        foodlist + " are successfully added to your cart"
                      );
                      await innerDc.cancelAllDialogs();
                      return await innerDc.beginDialog(
                        Constant.dialogIds.cartDialogId,
                        login
                      );
                    }
                  );
                }
              } else {
                await innerDc.context.sendActivity(
                  `Can't found any details for your current order`
                );
                return { status: DialogTurnStatus.waiting };
              }
            })
            .catch(async (err) => {
              console.log(err);
              await innerDc.context.sendActivity(
                "Sorry we have no meals that you want to order please order some thing else"
              );
              return { status: DialogTurnStatus.waiting };
            });
          return { status: DialogTurnStatus.waiting };
        }
      } catch (err) {
        await innerDc.context.sendActivity(
          "Unable to understand your language please try again"
        );
        return { status: DialogTurnStatus.waiting };
      }
    } else if (topintent === "Meal_Category") {
      try {
        if (
          Array.isArray(luisresult.entities.categories[0].categoryname) &&
          luisresult.entities.categories[0].categoryname.length > 0
        ) {
          let meal_category_request =
            luisresult.entities.categories[0].categoryname.map(
              async (value) => {
                return await searchMealsByCatagory(value);
              }
            );
          await Promise.allSettled(meal_category_request)
            .then(async (result) => {
              let notfind = [];
              let mealscardAttachment = [];
              result.forEach((val, index) => {
                if (val.status === "fulfilled") {
                  mealscardAttachment.push(
                    val.value.meals.map((meal) => {
                      let dis = random(10, 50);
                      let price = random(210, 500);
                      let { sellingprice, discountprice } = discount(
                        price,
                        dis
                      );
                      return CardFactory.heroCard(
                        meal.strMeal,
                        CardFactory.images([meal.strMealThumb]),
                        CardFactory.actions([
                          {
                            type: ActionTypes.PostBack,
                            title: "Reviews",
                            value: {
                              button: "review",
                              mealid: meal.idMeal,
                            },
                          },
                          {
                            type: ActionTypes.PostBack,
                            title: `Add to Cart`,
                            value: {
                              button: "addtocart",
                              mealdetails: {
                                mealid: meal.idMeal,
                                mealname: meal.strMeal,
                                mealimage: meal.strMealThumb,
                                sellingprice,
                                discountprice,
                                discount: dis,
                                originalprice: price,
                              },
                            },
                          },
                          {
                            type: ActionTypes.PostBack,
                            title: `₹${sellingprice}/- Order Now`,
                            value: {
                              button: "ordernow",
                              mealdetails: {
                                mealid: meal.idMeal,
                                mealname: meal.strMeal,
                                mealimage: meal.strMealThumb,
                                sellingprice,
                                discountprice,
                                discount: dis,
                                originalprice: price,
                              },
                            },
                          },
                        ]),
                        {
                          subtitle: `Rating: ${ratings(
                            4.3
                          )} ${dis}% off you save ₹${price - discountprice}/-`,
                        }
                      );
                    })
                  );
                } else {
                  notfind.push(
                    luisresult.entities.categories[0].categoryname[index]
                  );
                }
              });

              if (mealscardAttachment.length > 0) {
                if (notfind.length > 0) {
                  await innerDc.context.sendActivity(
                    "unable to find result for " + notfind.join(",")
                  );
                }
                await innerDc.cancelAllDialogs();
                return await innerDc.beginDialog(
                  Constant.dialogIds.mealsCategroiesId,
                  {
                    ...login,
                    attachments: mealscardAttachment.flat(Infinity),
                  }
                );
              } else {
                await innerDc.context.sendActivity(
                  "Sorry i didn't find any results for " +
                    luisresult.entities.categories[0].categoryname.join(",")
                );
                await innerDc.cancelAllDialogs();
                return await innerDc.beginDialog(
                  Constant.dialogIds.mealsCategroiesId,
                  login
                );
              }
            })
            .catch(async (err) => {
              console.log(err);
              await innerDc.context.sendActivity(
                "Sorry i didn't find any results for " +
                  luisresult.entities.categories[0].categoryname.join(",") +
                  " Please Try again"
              );
              return { status: DialogTurnStatus.waiting };
            });
          return { status: DialogTurnStatus.waiting };
        } else {
          return await innerDc.replaceDialog(
            Constant.dialogIds.mealsCategroiesId,
            login
          );
        }
      } catch (err) {
        await innerDc.context.sendActivity(
          "Unable to understand your language please try again"
        );
        return { status: DialogTurnStatus.waiting };
      }
    } else if (topintent === "Cuisines") {
      try {
        if (
          Array.isArray(luisresult.entities.categories[0].cuisines) &&
          luisresult.entities.categories[0].cuisines.length > 0
        ) {
          let meal_category_request =
            luisresult.entities.categories[0].cuisines.map(async (value) => {
              return await getMealsForCuisines(value);
            });
          await Promise.allSettled(meal_category_request)
            .then(async (result) => {
              let notfind = [];
              let mealscardAttachment = [];
              result.forEach((val, index) => {
                if (val.status === "fulfilled") {
                  mealscardAttachment.push(
                    val.value.map((meal) => {
                      let dis = random(10, 50);
                      let price = random(210, 500);
                      let { sellingprice, discountprice } = discount(
                        price,
                        dis
                      );
                      return CardFactory.heroCard(
                        meal.strMeal,
                        CardFactory.images([meal.strMealThumb]),
                        CardFactory.actions([
                          {
                            type: ActionTypes.PostBack,
                            title: "Reviews",
                            value: {
                              button: "review",
                              mealid: meal.idMeal,
                            },
                          },
                          {
                            type: ActionTypes.PostBack,
                            title: `Add to Cart`,
                            value: {
                              button: "addtocart",
                              mealdetails: {
                                mealid: meal.idMeal,
                                mealname: meal.strMeal,
                                mealimage: meal.strMealThumb,
                                sellingprice,
                                discountprice,
                                discount: dis,
                                originalprice: price,
                              },
                            },
                          },
                          {
                            type: ActionTypes.PostBack,
                            title: `₹${sellingprice}/- Order Now`,
                            value: {
                              button: "ordernow",
                              mealdetails: {
                                mealid: meal.idMeal,
                                mealname: meal.strMeal,
                                mealimage: meal.strMealThumb,
                                sellingprice,
                                discountprice,
                                discount: dis,
                                originalprice: price,
                              },
                            },
                          },
                        ]),
                        {
                          subtitle: `Rating: ${ratings(
                            4.3
                          )} ${dis}% off you save ₹${price - discountprice}/-`,
                        }
                      );
                    })
                  );
                } else {
                  notfind.push(
                    luisresult.entities.categories[0].categoryname[index]
                  );
                }
              });

              if (mealscardAttachment.length > 0) {
                if (notfind.length > 0) {
                  await innerDc.context.sendActivity(
                    "unable to find result for " + notfind.join(",")
                  );
                }
                await innerDc.cancelAllDialogs();
                return await innerDc.beginDialog(
                  Constant.dialogIds.cuisinesDialogId,
                  {
                    ...login,
                    attachments: mealscardAttachment.flat(Infinity),
                  }
                );
              } else {
                await innerDc.context.sendActivity(
                  "Sorry i didn't find any results for " +
                    luisresult.entities.categories[0].cuisines.join(",")
                );
                await innerDc.cancelAllDialogs();
                return await innerDc.beginDialog(
                  Constant.dialogIds.cuisinesDialogId,
                  login
                );
              }
            })
            .catch(async (err) => {
              console.log(err);
              await innerDc.context.sendActivity(
                "Sorry i didn't find any results for " +
                  luisresult.entities.categories[0].cuisines.join(",") +
                  " Please Try again"
              );
              return { status: DialogTurnStatus.waiting };
            });
          return { status: DialogTurnStatus.waiting };
        } else {
          return await innerDc.replaceDialog(
            Constant.dialogIds.mealsCategroiesId,
            login
          );
        }
      } catch (err) {
        console.log(err);
        await innerDc.context.sendActivity(
          "Unable to understand your language please try again"
        );
        return { status: DialogTurnStatus.waiting };
      }
    } else if (topintent === "Orders") {
      await innerDc.cancelAllDialogs();
      return await innerDc.beginDialog(
        Constant.dialogIds.myorderDialogId,
        login
      );
    } else {
      await innerDc.context.sendActivity(Constant.LuisErrorMessage);
      return { status: DialogTurnStatus.waiting };
    }
  }
}
module.exports.RootDialog = RootDialog;
