const {
  ActivityTypes,
  CardFactory,
  ActionTypes,
  AttachmentLayoutTypes,
} = require("botbuilder-core");
const {
  ComponentDialog,
  WaterfallDialog,
  ChoicePrompt,
  ChoiceFactory,
  Dialog,
  NumberPrompt,
} = require("botbuilder-dialogs");
const {
  getVerityCuisines,
  getMealsForCuisines,
} = require("../../api/mealCategories");
const { addItemToCart } = require("../../db/Curd");
const NUMBER_PROMPT = "NUMBER_PROMPT_CUISINES";
const { Constant } = require("../../helper/Constant");
const { random, discount, ratings } = require("../../helper/utility");
const CHOICE_PROMPT = "CHOICE_PROMPT_CUISINES";
const { OrderProcess } = require("../OrderProcess");
class Cuisines extends ComponentDialog {
  constructor(userState, conversationState) {
    super(Constant.dialogIds.cuisinesDialogId);
    this.userState = userState;
    this.conversationState = conversationState;
    this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
    this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.checkValidQuantity));
    this.addDialog(new OrderProcess(userState, conversationState));
    this.addDialog(
      new WaterfallDialog(Constant.dialogIds.cuisinesDialogId, [
        this.showAllCuisines.bind(this),
        this.showAllMealsOfCuisines.bind(this),
        this.orderMeal.bind(this),
        this.addIteamToCart.bind(this),
      ])
    );
    this.initialDialogId = Constant.dialogIds.cuisinesDialogId;
  }
  async showAllCuisines(step) {
    if (!step.options.attachments && !step.options.reviewmode) {
      const cuisines = await getVerityCuisines();
      if (cuisines) {
        await step.prompt(CHOICE_PROMPT, {
          prompt: "Please select the cuisines you want order from us",
          choices: ChoiceFactory.toChoices(
            cuisines.map((value) => {
              return value.strArea;
            })
          ),
        });
      }
    } else if (step.options.attachments && !step.options.reviewmode) {
      return await step.next(step.options.attachments);
    } else if (step.options.reviewmode) {
      return await step.next(true);
    }
    return Dialog.EndOfTurn;
  }
  async showAllMealsOfCuisines(step) {
    if (step.result && step.result.value) {
      await step.context.sendActivity({ type: ActivityTypes.Typing });
      const cuisines = await getMealsForCuisines(step.result.value);
      if (cuisines) {
        await step.context.sendActivity(
          `Currently we have these foods of ${step.result.value}`
        );
        await step.context.sendActivity({ type: ActivityTypes.Typing });
        await step.context.sendActivity({
          attachments: cuisines.map((value) => {
            let dis = random(10, 50);
            let price = random(210, 500);
            let { sellingprice, discountprice } = discount(price, dis);
            return CardFactory.heroCard(
              value.strMeal,
              CardFactory.images([value.strMealThumb]),
              CardFactory.actions([
                {
                  type: ActionTypes.PostBack,
                  title: "Reviews",
                  value: {
                    button: "review",
                    mealid: value.idMeal,
                  },
                },
                {
                  type: ActionTypes.PostBack,
                  title: `Add to Cart`,
                  value: {
                    button: "addtocart",
                    mealdetails: {
                      mealid: value.idMeal,
                      mealname: value.strMeal,
                      mealimage: value.strMealThumb,
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
                      mealid: value.idMeal,
                      mealname: value.strMeal,
                      mealimage: value.strMealThumb,
                      sellingprice,
                      discountprice,
                      discount: dis,
                      originalprice: price,
                    },
                  },
                },
              ]),
              {
                subtitle: `Rating: ${ratings(4.3)} ${dis}% off you save ₹${
                  price - discountprice
                }/-`,
              }
            );
          }),
          attachmentLayout: AttachmentLayoutTypes.Carousel,
        });
      } else {
        await step.context.sendActivity(
          "We couldn't able to fetch your details Please Try again"
        );
        return await step.replaceDialog(this.id, step.options);
      }
    } else if (step.options.attachments) {
      await step.context.sendActivity({ type: ActivityTypes.Typing });
      await step.context.sendActivity({
        attachments: step.options.attachments,
        attachmentLayout: AttachmentLayoutTypes.Carousel,
      });
    }
    return Dialog.EndOfTurn;
  }
  async orderMeal(step) {
    if (
      step.context.activity.value &&
      step.context.activity.value.button === "ordernow"
    ) {
      return step.replaceDialog(Constant.dialogIds.orderProcessing, {
        logindetails: { ...step.options },
        mealsDetails: step.context.activity.value.mealdetails,
      });
    } else if (
      step.context.activity.value &&
      step.context.activity.value.button === "addtocart"
    ) {
      step.values.mealdetails = step.context.activity.value.mealdetails;
      await step.prompt(NUMBER_PROMPT, {
        prompt: `Please Enter the ${step.context.activity.value.mealdetails.mealname} quantity that you want to add to cart`,
        retryPrompt: "Please Enter a valid number and a number between 0 to 10",
      });
    } else if (
      step.context.activity.value &&
      step.context.activity.value.button === "review"
    ) {
      let conversationId = TurnContext.getConversationReference(
        step.context.activity
      ).conversation.id;
      await step.context.sendActivity({
        value: {
          code: "3657",
          url: `${process.env.BASE_URL}/product/review/${step.context.activity.value.mealid}/${step.options.uid}/${conversationId}`,
          prompt: "continue",
        },
      });
      return await step.replaceDialog(this.id, {
        ...step.options,
        reviewmode: true,
      });
    }
    return Dialog.EndOfTurn;
  }
  async addIteamToCart(step) {
    if (Number.isInteger(step.result)) {
      const isAdded = await addItemToCart(step.options.uid, {
        ...step.values.mealdetails,
        quantity: step.result,
      });
      if (isAdded) {
        await step.context.sendActivity(
          "You item is successfully added to your cart"
        );
        return await step.replaceDialog(Constant.dialogIds.rootDialogID);
      } else {
        await step.context.sendActivity(
          `Hi ${step.options.name} your item is not added to your cart due to some technical issues please try again`
        );
        return await step.replaceDialog(this.id, step.options);
      }
    }
  }
  async checkValidQuantity(promptContext) {
    return (
      promptContext.recognized.succeeded &&
      promptContext.recognized.value >= 1 &&
      promptContext.recognized.value <= 10
    );
  }
}
module.exports.Cuisines = Cuisines;
