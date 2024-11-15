# Specifies a base image, a specific version of the Node.js image.
FROM node:20.8.0-bullseye-slim

# Creates a working directory in the Docker image. The application will be placed here.
WORKDIR /usr/src/app

# Copies the package.json and package-lock.json (or npm-shrinkwrap.json) to the app directory.
# This is done separately from copying the rest of the app's code to leverage Docker's cache.
# As a result, the Docker image layer with installed dependencies is only rebuilt when these files change.
COPY package*.json ./

# Installs the dependencies in a way that's optimized for production.
# The --omit=dev flag ensures that devDependencies are not installed.
RUN npm ci --omit=dev

# Copies the rest of the application code to the app directory.
COPY . .

# Create the log directory
RUN mkdir -p /var/log/just-task-it

# Change the owner of the log directory to the node user
RUN chown -R node:node /var/log/just-task-it

# Sets the user that the Docker container runs as. In this case, it's set to 'node' to avoid running as root for security reasons.
USER node

# Exposes a port that the application listens on. The actual port number is provided by the NODE_PORT environment variable.
EXPOSE ${NODE_PORT}

# Defines the command to run the application. In this case, the Node.js server is started.
CMD [ "node", "src/server.js"]
