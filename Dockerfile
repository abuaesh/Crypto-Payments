FROM node:12.16.1
WORKDIR /usr/app
COPY package*.json ./
COPY . .

RUN npm install gulp webpack webpack-cli -gulp
RUN npm install
RUN gulp build-all


EXPOSE 6095

CMD [ "node", "app.js" ]