FROM node:14.7.0 as build
WORKDIR /app
COPY . /app
RUN npm install
COPY . .
EXPOSE 80
CMD ["node", "app.js"]