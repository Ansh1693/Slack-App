require("dotenv").config();
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

const modal = {
  type: "modal",
  callback_id: "submit_message",
  title: {
    type: "plain_text",
    text: "InternBit",
    emoji: true,
  },
  submit: {
    type: "plain_text",
    text: "Submit",
    emoji: true,
  },
  close: {
    type: "plain_text",
    text: "Cancel",
    emoji: true,
  },
  blocks: [
    {
      type: "section",
      block_id: "user_block",
      text: {
        type: "mrkdwn",
        text: "Message a user",
      },
      accessory: {
        type: "users_select",

        placeholder: {
          type: "plain_text",
          text: "Select a user",
          emoji: true,
        },
        action_id: "users_select",
      },
    },
    {
      type: "input",
      block_id: "message_block",
      element: {
        type: "rich_text_input",
        action_id: "rich_text_input",
      },
      label: {
        type: "plain_text",
        text: "Message",
        emoji: true,
      },
    },
  ],
};

app.shortcut("message_user", async ({ ack, shortcut, client, logger }) => {
  try {
    await ack();
    const result = await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: modal,
    });

    logger.info(result);
  } catch (err) {
    console.log(err.data.response_metadata.messages);
    logger.error(err);
  }
});

app.view("submit_message", async ({ ack, body, view, client, logger }) => {
  try {
    await ack();

    const inputValues = view.state.values;

    const user = inputValues.user_block.users_select.selected_user;
    const message = inputValues.message_block.rich_text_input.rich_text_value;
    await client.chat.postMessage({
      channel: user,
      blocks: [message],
      as_user: true,
    });
  } catch (error) {
    logger.error(error);
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();
