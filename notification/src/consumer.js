const amqp = require('amqplib');
const axios = require('axios');

const RABBITMQ_URL = `amqp://user:${process.env.RABBITMQ_PASSWORD}@rabbitmq.default.svc.cluster.local:5672`;
const QUEUE_NAME = 'task_queue';
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const CHANNEL_ID = "C049LRZ39FE";

async function sendSlackMessage(text) {
  try {
    const response = await axios.post(
      'https://slack.com/api/chat.postMessage',
      {
        channel: CHANNEL_ID,
        text: text,
      },
      {
        headers: {
          Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.ok) {
      console.log('Notification sent to Slack');
    } else {
      console.error('Error sending message to Slack:', response.data.error);
    }
  } catch (error) {
    console.error('Error in sending message to Slack:', error);
  }
}

async function consumeMessages() {
  while (true) {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });

      console.log(`Waiting for messages in ${QUEUE_NAME}`);
      channel.consume(QUEUE_NAME, async (msg) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          console.log('Message content:', messageContent);

          // Parse the message and format it for Slack
          const message = JSON.parse(messageContent);
          const notificationText = formatSlackMessage(message);

          console.log(`Formatted Slack message: ${notificationText}`);

          // Send the formatted message to Slack
          await sendSlackMessage(notificationText);

          channel.ack(msg);
        }
      });
      break; // Exit retry loop if successful
    } catch (error) {
      console.error('Error in consuming messages:', error);
      console.log('Retrying connection in 5 seconds...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

function formatSlackMessage(message) {
  const { event, task, user } = message;
  return `${task} was ${event} by ${user}.`;
}

module.exports = { consumeMessages };
