const express = require('express');
const { publishMessage } = require('./publisher');
const app = express();
app.use(express.json());

app.post('/send', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).send('Message is required');
  }
  await publishMessage(message);
  res.send('Message sent to queue');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Queue service is running on port ${PORT}`);
});
