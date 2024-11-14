// controllers/NotificationService.js
import redis from 'redis';
import axios from 'axios';

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
  }

  /**
   * Sends a formatted Slack notification for task events using the Slack API directly.
   * 
   * @param {string} type - The type of command on the task (e.g., "created").
   * @param {string} task - The task description.
   * @param {string} user - The username.
   */
  async sendNotification(type, task, user) {
    const message = `${task} was ${type} by ${user}.`;
    console.log('Sending notification to Slack:', message);
    console.log('Slack token when sending', this.slackToken);

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
        console.log('Notification sent to Slack successfully. 🎊🎊🎊🎊');
      } else {
        console.error('Error in Slack API response:');
        console.error('Response:', response);
        console.error('Response.data:', response.data);
      }
    } catch (error) {
      console.error('Error sending notification to Slack:', error);
    }
  }
}
