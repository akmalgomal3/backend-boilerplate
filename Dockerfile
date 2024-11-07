# get image
FROM node:18-alpine

# set working directory
WORKDIR /usr/src/app

# Install necessary dependencies, including Chromium
RUN apk update && \
    apk add --no-cache chromium udev ttf-freefont fontconfig

# copy package.json and package-lock.json
COPY package*.json ./

# install dependencies
RUN npm install

# copy source code
COPY . .

# Create Folder
RUN mkdir -p /usr/src/app/uploads

# build the appilcation
RUN npm run build

# define the command to run the application
ENTRYPOINT [ "/bin/sh", "-c", "npm run start:dev" ]
