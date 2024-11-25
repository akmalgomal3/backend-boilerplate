# Use Debian Slim as base image
FROM debian:bullseye-slim

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Set working directory
WORKDIR /usr/src/app

# Install necessary dependencies, including Chromium
RUN apt-get update && \
    apt-get install -y chromium-driver chromium fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 xdg-utils ttf-freefont fontconfig && \
    rm -rf /var/lib/apt/lists/*
    
# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Define the command to run the application
CMD ["npm", "run", "start:dev"]

