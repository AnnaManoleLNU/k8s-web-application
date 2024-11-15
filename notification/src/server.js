const express = require('express');
const { consumeMessages } = require('./consumer');
const app = express();

consumeMessages();

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Notification service is running on port ${PORT}`);
});
