const amqp = require('amqplib');
const axios = require('axios');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
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
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`Waiting for messages in ${QUEUE_NAME}`);
    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        const message = msg.content.toString();
        console.log(`Received message: ${message}`);

        // Send the message to Slack
        await sendSlackMessage(message);

        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Error in consuming messages:', error);
  }
}

module.exports = { consumeMessages };
