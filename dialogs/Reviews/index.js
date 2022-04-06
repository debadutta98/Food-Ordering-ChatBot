const { ActionTypes, TurnContext } = require("botbuilder");
const { CardFactory } = require("botbuilder-core");
const {
  ComponentDialog,
  WaterfallDialog,
  Dialog,
  ChoiceFactory,
} = require("botbuilder-dialogs");
const { showReviewDetails } = require("../../Cards/showReviewDetails");
const { findSuccessfulOrdersForReviews } = require("../../db/Curd");
const { Constant } = require("../../helper/Constant");
class Reviews extends ComponentDialog {
  constructor(userState, converSationState) {
    super(Constant.dialogIds.reviewDialogId);
    this.userState = userState;
    this.converSationState = converSationState;
    this.converSationData =
      this.converSationState.createProperty("REVIEW_DETAILS");
    this.addDialog(
      new WaterfallDialog(Constant.dialogIds.reviewDialogId, [
        this.getAllSuccessfulOrders.bind(this),
        this.showCard.bind(this),
      ])
    );
    this.initialDialogId = Constant.dialogIds.reviewDialogId;
  }
  async getAllSuccessfulOrders(step) {
    let review = await this.converSationData.get(step.context, {});
    if (step.options && !step.options.waiting) {
      let allorders = await findSuccessfulOrdersForReviews(step.options.uid);
      if (allorders && Array.isArray(allorders)) {
        let convId = TurnContext.getConversationReference(step.context.activity)
          .conversation.id;
        allorders.forEach((value) => {
          review[value.order_id] = { completed: false };
        });
        await step.context.sendActivity({
          attachments: [
            CardFactory.adaptiveCard(
              showReviewDetails(step.options.uid, allorders, convId)
            ),
          ],
        });
      } else {
        await step.context.sendActivity(allorders.errorMessage);
        return await step.replaceDialog(Constant.dialogIds.rootDialogID);
      }
    }
    return Dialog.EndOfTurn;
  }
  async showCard(step) {
    if (step.context.activity.value && step.context.activity.value.reviewlink) {
      await step.context.sendActivity({
        value: {
          code: "4096",
          url: step.context.activity.value.reviewlink,
          prompt: "continue",
        },
      });
      return await step.replaceDialog(this.id, { waiting: true });
      // await step.context.sendActivity({
      //   attachments: [
      //     CardFactory.thumbnailCard(
      //       "Submit your Feedbacks",
      //       [
      //         {
      //           url: "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/344/external-reviews-literature-flaticons-lineal-color-flat-icons-3.png",
      //         },
      //       ],
      //       [
      //         {
      //           type: ActionTypes.OpenUrl,
      //           title: "Submit Review",
      //           value: step.context.activity.value.reviewlink,
      //         },
      //       ],
      //       {
      //         subtitle: "Please click the below link to submit your review",
      //       }
      //     ),
      //   ],
      //   value: step.context.activity.value.reviewlink,
      // });
    } else {
      if (step.context.activity.value && step.context.activity.value.error) {
        await step.context.sendActivity(step.context.activity.value.message);
        return await step.replaceDialog(Constant.dialogIds.rootDialogID);
      } else {
        let review = await this.converSationData.get(step.context);
        review[step.context.activity.value.order_id].completed = true;
        let orderReview = Object.values(review).filter((value) => {
          return !value.completed;
        });
        if (orderReview.length) {
          return await step.replaceDialog(this.id, { waiting: true });
        }
        await step.context.sendActivity(
          "Your review for all Order is completed Successfully"
        );
        return await step.replaceDialog(Constant.dialogIds.rootDialogID);
      }
    }
  }
}
module.exports.Reviews = Reviews;
