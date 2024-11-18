import express from 'express';
import { consumeMessages } from './consumer.js';

const app = express();

consumeMessages();

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Notification service is running on port ${PORT}`);
});
