import redis from 'redis';
import axios from 'axios';
import amqp from 'amqplib';

export class NotificationService {
  constructor() {
    // Set up the Redis client
    this.redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
    });
    this.redisClient.connect().catch(console.error);
    this.redisClient.on('error', (err) => console.error('Redis Subscriber Error:', err));

    // Set up Slack variables
    this.slackToken = process.env.SLACK_BOT_TOKEN;
    this.slackChannel = 'C049LRZ39FE';

    // Start consuming messages from the queue
    this.initQueueListener();
  }

  /**
   * Initialize queue listener to consume messages from RabbitMQ.
   */
  async initQueueListener() {
    try {
      const connection = await amqp.connect(process.env.QUEUE_URL);
      const channel = await connection.createChannel();
      const queue = 'task_notifications';

      await channel.assertQueue(queue, { durable: true });
      console.log(`Listening for messages in queue: ${queue}`);

      channel.consume(queue, async (msg) => {
        if (msg !== null) {
          const { type, task, user } = JSON.parse(msg.content.toString());
          await this.sendNotification(type, task, user);
          channel.ack(msg);
        }
      });
    } catch (error) {
      console.error('Error initializing queue listener:', error);
    }
  }

  /**
   * Sends a formatted Slack notification for task events using the Slack API.
   * 
   * @param {string} type - The type of command on the task (e.g., "created", "completed").
   * @param {string} task - The task description.
   * @param {string} user - The username.
   */
  async sendNotification(type, task, user) {
    const message = `${task} was ${type} by ${user}.`;
    console.log('Sending notification to Slack:', message);

    try {
      const response = await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel: this.slackChannel,
          text: message,
        },
        {
          headers: {
            Authorization: `Bearer ${this.slackToken}`,
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );

      if (response.data.ok) {
        console.log('Notification sent to Slack successfully. 🎊');
      } else {
        console.error('Error in Slack API response:', response.data);
      }
    } catch (error) {
      console.error('Error sending notification to Slack:', error);
    }
  }
}
