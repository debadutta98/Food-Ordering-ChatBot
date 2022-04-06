const { TurnContext } = require("botbuilder");
const {
  CardFactory,
  ActionTypes,
  AttachmentLayoutTypes,
  ActivityTypes,
} = require("botbuilder-core");
const {
  ComponentDialog,
  Dialog,
  WaterfallDialog,
  NumberPrompt,
} = require("botbuilder-dialogs");
const { meals, searchMealsByCatagory } = require("../../api/mealCategories");
const { addItemToCart, getAllReviewForFood } = require("../../db/Curd");
const { Constant } = require("../../helper/Constant");
const { ratings, random, discount } = require("../../helper/utility");
const { OrderProcess } = require("../OrderProcess");
const NUMBER_PROMPT = "NUMBER_PROMPT_MEALS_CATEGORIES";
class MealsCategories extends ComponentDialog {
  constructor(userState, conversationState) {
    super(Constant.dialogIds.mealsCategroiesId);
    this.userState = userState;
    this.conversationState = conversationState;
    this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.checkValidQuantity));
    this.addDialog(new OrderProcess(userState, conversationState));
    this.addDialog(
      new WaterfallDialog(Constant.dialogIds.mealsCategroiesId, [
        this.initialStep.bind(this),
        this.searchFoodByCategory.bind(this),
        this.finalStep.bind(this),
        this.addIteamToCart.bind(this),
      ])
    );
    this.initialDialogId = Constant.dialogIds.mealsCategroiesId;
  }
  async initialStep(step) {
    if (!step.options.attachments && !step.options.reviewmode) {
      const MEALS_CATAGORIES = await meals();
      await step.context.sendActivity({ type: ActivityTypes.Typing });
      if (
        MEALS_CATAGORIES &&
        !MEALS_CATAGORIES.error &&
        MEALS_CATAGORIES.categories
      ) {
        await step.context.sendActivity(
          "Please select a Catagory from below list"
        );
        await step.context.sendActivity({ type: ActivityTypes.Typing });
        await step.context.sendActivity({
          attachments: MEALS_CATAGORIES.categories.map((value) => {
            return CardFactory.thumbnailCard(
              value.strCategory,
              [{ url: value.strCategoryThumb }],
              [
                {
                  type: ActionTypes.PostBack,
                  title: "Select",
                  value: { catagory: value.strCategory },
                },
              ],
              {
                subtitle: `Ratings: ${ratings(4.3)}`,
                text: value.strCategoryDescription.split(".")[0],
              }
            );
          }),
          attachmentLayout: AttachmentLayoutTypes.Carousel,
        });
      } else {
        await step.context.sendActivity(
          MEALS_CATAGORIES.error + "Please Try again"
        );
        return await step.replaceDialog(Constant.dialogIds.rootDialogID);
      }
    } else if (step.options.attachments && !step.options.reviewmode) {
      return await step.next(step.options.attachments);
    } else if (step.options.reviewmode) {
      return await step.next(step.options.reviewmode);
    }
    return Dialog.EndOfTurn;
  }
  async searchFoodByCategory(step) {
    if (step.context.activity.value && step.context.activity.value.catagory) {
      const MEAL_RESULT = await searchMealsByCatagory(
        step.context.activity.value.catagory
      );
      if (MEAL_RESULT && MEAL_RESULT.meals && !MEAL_RESULT.error) {
        await step.context.sendActivity(
          `Currently we have these foods of ${step.context.activity.value.catagory}`
        );
        await step.context.sendActivity({ type: ActivityTypes.Typing });
        await step.context.sendActivity({
          attachments: MEAL_RESULT.meals.map((value) => {
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
        await step.context.sendActivity(MEAL_RESULT.error + "Please Try again");
        return await step.replaceDialog(this.id, step.options);
      }
    } else if (step.options.attachments && !step.options.reviewmode) {
      await step.context.sendActivity({ type: ActivityTypes.Typing });
      await step.context.sendActivity({
        attachments: step.options.attachments,
        attachmentLayout: AttachmentLayoutTypes.Carousel,
      });
    }
    return Dialog.EndOfTurn;
  }
  async finalStep(step) {
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
    console.log(step.context.activity.value);
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
    return Dialog.EndOfTurn;
  }
  async checkValidQuantity(promptContext) {
    return (
      promptContext.recognized.succeeded &&
      promptContext.recognized.value >= 1 &&
      promptContext.recognized.value <= 10
    );
  }
}
module.exports.MealsCategories = MealsCategories;
