#Build front end app with node js 18 image with Alpine Linux
FROM node:20-alpine as builder
#Set the container working directory in /app
WORKDIR /app
#Copy package.json y package-lock.json to the container
COPY package*.json ./
#Install dependencies defined in package.json
RUN npm install
#Copy the rest of the application code to the container
COPY . .
#Build frontend apps
RUN npm run build
#Use nginx image
FROM nginx:alpine
#Copy build output from the builder to nginx folder
COPY --from=builder /app/dist /usr/share/nginx/html
#Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
#Expose port 80
EXPOSE 80
#Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]