FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm i -g typescript

COPY . .

RUN tsc


CMD ["node", "dist/index.js"]
