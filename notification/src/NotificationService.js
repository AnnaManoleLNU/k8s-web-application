import axios from "axios";
import amqp from "amqplib";

const RABBITMQ_URL = "amqp://rabbitmq:5672";
const QUEUE_NAME = "task_queue";
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const CHANNEL_ID = "C049LRZ39FE";

// Consumes messages from RabbitMQ and sends them to Slack
export class NotificationService {
  async #sendSlackMessage(text) {
    try {
      const response = await axios.post(
        "https://slack.com/api/chat.postMessage",
        {
          channel: CHANNEL_ID,
          text: text,
        },
        {
          headers: {
            Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.ok) {
        console.log("Notification sent to Slack");
      } else {
        console.error("Error sending message to Slack:", response.data.error);
      }
    } catch (error) {
      console.error("Error in sending message to Slack:", error);
    }
  }

  async #getSlackUserId() {
    try {
      const response = await axios.get(
        "https://slack.com/api/auth.test",
        {
          headers: {
            Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
          },
        }
      );

      const data = await response.json();
      console.log(data);

      if (data.ok) {
        return data.user_id;
      } else {
        console.error("Error getting user ID from Slack:", data.error);
        return null;
      }
    } catch (error) {
      console.error("Error in getting user ID from Slack:", error);
      return null;
    }
  }

  async #getSlackUsername(userId) {
    try {
      const response = await axios.get(
        `https://slack.com/api/users.info?user=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
          },
        }
      );

      const data = await response.json();
      console.log(data);
      if (data.ok) {
        return data.user.name;
      } else {
        console.error("Error getting user info from Slack:", data.error);
        return "Unknown user";
      }
    } catch (error) {
      console.error("Error in getting user info from Slack:", error);
      return "Unknown user";
    }
  }

  async consumeMessages() {
    while (true) {
      try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        channel.consume(QUEUE_NAME, async (msg) => {
          if (msg !== null) {
            const messageContent = msg.content.toString();

            // Parse the message and format it for Slack
            const message = JSON.parse(messageContent);
            const userId = await this.#getSlackUserId();
            const user = await this.#getSlackUsername(userId);

            const notificationText = this.#formatSlackMessage({
              event: message.event,
              task: message.task,
              user: user,
            });

            await this.#sendSlackMessage(notificationText);

            // Acknowledge the message to RabbitMQ
            channel.ack(msg);
          }
        });
        break; // Exit retry loop if successful
      } catch (error) {
        console.error("Error in consuming messages:", error);
        console.log("Retrying connection in 5 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  #formatSlackMessage(message) {
    const { event, task, user } = message;
    return `${task} was ${event} by ${user}.`;
  }
}
