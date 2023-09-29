FROM node:lts-alpine as build
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . ./

RUN npm run build


FROM node:lts-alpine as runtime
WORKDIR /app
COPY --from=build /app/build ./
COPY --from=build /app/package.json ./

ENV NODE_ENV production
EXPOSE 5000

CMD [ "node", "index.js" ]

