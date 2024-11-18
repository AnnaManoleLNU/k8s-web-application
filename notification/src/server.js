import express from 'express'
import { NoficationService } from './consumer.js'

const app = express()

const notificationService = new NoficationService()
notificationService.consumeMessages()

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`Notification service is running on port ${PORT}`)
})
