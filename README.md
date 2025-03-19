# Just Task It Application Extension

This project extends the JTI example application by fixing existing issues and adding new functionality.

## Overview  
The goal is to enhance the JTI application, ensure continuous delivery using a GitLab pipeline, and deploy the application to a Kubernetes cluster.

## Features
### **1. Application Setup**  
- Extend the existing JTI application.  
- Deploy the application in a Kubernetes cluster with at least three worker nodes.  
- The cluster supports multiple instances of the Taskit and Notification services.  

### **2. Continuous Delivery**  
- Set up a GitLab pipeline to automate updates to the cluster's services.  

### **3. Taskit Service Fixes**  
- **Session handling:** Store sessions in a key-value store instead of memory with Redis.
- **Notifications:** Implement asynchronous single-receiver pattern between Taskit and Notification services with RabbitMQ.
- **Data persistence:** Store data on a mounted volume.

### **4. Notification Service**  
- Dequeue messages from the message broker and post them to the Slack channel `#2dv013-notifications`.  
- Include:  
  - Command type (e.g., "created," "completed," "uncompleted")  
  - Task details (e.g., "Buy milk")  
  - Username (e.g., "en999zzz")  
- Example: *"Buy milk was completed by en999zzz."*  
- Use Slack bot credentials from GitLab Secrets.  

### **5. Techniques**  
- Terraform  
- Kubernetes  
- Redis for session management in Node.js  
- RabbitMQ installation using Helm 
