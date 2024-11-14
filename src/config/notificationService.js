import { NotificationService } from "../controllers/NotificationService";

// Instantiate the service to start listening to the queue
export const notificationService = new NotificationService();
console.log("Notification Service has started and is listening for messages...");
