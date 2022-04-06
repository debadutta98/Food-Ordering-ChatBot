// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, TurnContext } = require("botbuilder");
const { CardFactory, MessageFactory } = require("botbuilder-core");
const { singin } = require("../Cards/unauthentication");
const { welcomeCard } = require("../Cards/Welcome");
const { addconversationId, findUser } = require("../db/Curd");
const { getLoginInfo } = require("../helper/Context");
class FoodBot extends ActivityHandler {
  constructor(userState, conversationState, dialog, conversationReferences) {
    super();
    this.userState = userState;
    this.conversationState = conversationState;
    this.dialog = dialog;
    this.conversationReferences = conversationReferences;
    this.dialogState = this.conversationState.createProperty("DialogState");
    this.onEvent(async (context, next) => {
      if (context.activity.name === "webchat/logout") {
        await context.sendActivity(context.activity.value.message);
      } else if (context.activity.name === "webchat/welcome") {
        let userinfo = getLoginInfo(context.activity.from.id);
        await context.sendActivity({
          attachments: [CardFactory.adaptiveCard(welcomeCard(userinfo.name))],
        });
      }
      await next();
    });
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
        if (membersAdded[cnt].id !== context.activity.recipient.id) {
          const convId = TurnContext.getConversationReference(context.activity)
            .conversation.id;
          console.log(["Conversation Id", convId]);
          console.log(["from activity ID"], context.activity.from.id);
          let userinfo = getLoginInfo(context.activity.from.id);
          if (!userinfo) {
            await context.sendActivity({
              attachments: [CardFactory.adaptiveCard(singin(convId))],
              value: `${process.env.BASE_URL}/login/${convId}`,
            });
          } else {
            await dialog.run(context, this.dialogState);
          }
        }
      }
      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
    this.onMembersRemoved(async (context, next) => {
      console.log(["Member Removed"], context.activity.from.id);
      await next();
    });
    this.onConversationUpdate(async (context, next) => {
      await this.addConversationReference(context.activity);
      await next();
    });

    this.onMessage(async (context, next) => {
      await dialog.run(context, this.dialogState);
      await next();
    });
    this.onDialog(async (context, next) => {
      await this.conversationState.saveChanges(context, false);
      await this.userState.saveChanges(context, false);
      await next();
    });
  }

  async run(context) {
    await super.run(context);
    await this.addConversationReference(context.activity);
    // Save any state changes. The load happened during the execution of the Dialog.
    await this.conversationState.saveChanges(context, false);
    await this.userState.saveChanges(context, false);
  }
  async addConversationReference(activity) {
    const conversationReference =
      TurnContext.getConversationReference(activity);
    let userinfo = getLoginInfo(activity.from.id);
    if (userinfo) {
      let userPresent = await findUser(userinfo.user_id);
      if (userPresent) {
        await addconversationId(
          userinfo.user_id,
          conversationReference.conversation.id
        );
      }
    }
    this.conversationReferences[conversationReference.conversation.id] =
      conversationReference;
  }
}

module.exports.FoodBot = FoodBot;
