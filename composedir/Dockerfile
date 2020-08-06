FROM node:7
WORKDIR /kraken/src
COPY package.json /kraken
RUN npm install
COPY . /kraken
CMD node --experimental-json-modules --no-warnings app.js
