import express from 'express'
import { NotificationService } from './NotificationService.js'

const app = express()

const notificationService = new NotificationService()
notificationService.consumeMessages()

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`Notification service is running on port ${PORT}`)
})
