const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'task_queue';

async function publishMessage(message) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    channel.sendToQueue(QUEUE_NAME, Buffer.from(message));
    console.log(`Message sent to queue: ${message}`);
    setTimeout(() => connection.close(), 500);
  } catch (error) {
    console.error('Error in publishing message:', error);
  }
}

module.exports = { publishMessage };
