# FROM oven/bun
FROM node:lts-alpine 

ENV NODE_ENV production
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run pgenerate

EXPOSE 4000
CMD [ "npm", "run", "start" ]
