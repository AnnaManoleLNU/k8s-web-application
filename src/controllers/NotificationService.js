// controllers/NotificationService.js
import redis from 'redis';
import { WebClient } from '@slack/web-api';

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

    // Set up Slack client
    this.slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
    this.slackChannel = process.env.CHANNEL_ID
  }

  /**
   * Sends a formatted Slack notification for task events.
   * 
   * @param {string} type - The type of command on the task (e.g., "created").
   * @param {string} task - The task description.
   * @param {string} user - The username.
   */
  async sendNotification(type, task, user) {
    const message = `${task} was ${type} by ${user}.`;
    try {
      await this.slackClient.chat.postMessage({
        channel: this.slackChannel,
        text: message,
      });
      console.log('Notification sent to Slack successfully.');
    } catch (error) {
      console.error('Error sending notification to Slack:', error);
    }
  }
}
