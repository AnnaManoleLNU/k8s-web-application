# Dockerized Web Application

## Overview

This represents a Docker implementation of the 'Just Task It!' web application.

## How to Use

To execute the application, Docker must be installed on your system. Additionally, certain environment variables need to be set for the application to function correctly. These include:

1. DOCKER_PORT: This variable should be set to the port number on which your application will be accessible.
2. SESSION_SECRET: This variable is used for session management in your application. It should be set to a secret passphrase.
3. DOCKER_HOST: If a using a remote server, this variable should be set to the address of the remote server. Docker uses this variable to determine the host on which its commands should be executed.

### Local Machine

If you're running on a local machine with [Docker Desktop](https://www.docker.com/) installed, you can execute the following commands:

For development environment:

```bash
npm run docker:dev
```

For production environment:

```bash
npm run docker:prod
```

### Cloud Machine (Ubuntu 22.04 with Docker, and NGINX Installed)

While automated deployment through a CI/CD pipeline like GitLab is the recommended approach for production environments, there might be scenarios where manual deployment is necessary. For instance, you might want to deploy manually to a remote server for initial testing purposes.

#### Manual deployment

To test your dockerized application, you can manually deploy and run it on your remote server.

Docker uses the DOCKER_HOST environment variable to determine the host on which its commands should be executed. By assigning an SSH URL to this variable, Docker can be directed to perform operations on a specified remote server.  In this case, you also need to add your private SSH key to the SSH agent using the ssh-add command.

> The process of adding your private SSH key to the SSH agent does differ between MacOS, Unix-like systems, and Windows.
>
> On MacOS, you can add your private SSH key to the SSH agent using the ssh-add command directly in the terminal:
>
> ```bash
> ssh-add -K /path/to/your/private/key.pem
> ```
>
> On Unix-like systems, the command would look like this:
>
> ```bash
> eval $(ssh-agent)
> ssh-add /path/to/your/private/key.pem
> ```
>
> On Windows, if you're using PowerShell, you can start the SSH agent and add your private key with the following commands:
>
> ```powershell
> # Start the SSH agent
> ssh-agent | Invoke-Expression
>
> # Add your private key to the SSH agent
> ssh-add 'C:\path\to\your\private\key.pem'
> ```

For Unix-like systems, the command would look like this:

```bash
DOCKER_HOST=ssh://ubuntu@<remote servers IP number> DOCKER_PORT=8080 SESSION_SECRET="june-compost-sniff8" docker compose -f docker-compose.yaml -f docker-compose.production.yaml up --build -d
```

In this command, ensure to replace `<remote server's IP number>` with your remote server's IP. Also, remember to add your private SSH key to the SSH agent using the ssh-add command.

For Windows PowerShell, you can set the environment variable and run the command like this:

```powershell
$env:DOCKER_HOST="ssh://ubuntu@<remote server's IP number>"; $env:DOCKER_PORT=8080; $env:SESSION_SECRET="june-compost-sniff8"; docker compose -f docker-compose.yaml -f docker-compose.production.yaml up --build -d
```

Again, replace `<remote server's IP number>` with your remote server's IP. For adding your private SSH key to the SSH agent on Windows, you might need to use a tool like PuTTY or OpenSSH which comes built-in with Windows 10.

#### Automated deployment

...coming soon
