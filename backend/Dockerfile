#Use oficial node js 18 image with Alpine Linux
FROM node:18-alpine
#Set the container working directory in /app
WORKDIR /app
#Copy package.json y package-lock.json to the container
COPY package*.json ./
#Install dependencies defined in package.json
RUN npm install
#Copy the rest of the application code to the container
COPY . .
#Default command when the container start
CMD ["npm", "start"]