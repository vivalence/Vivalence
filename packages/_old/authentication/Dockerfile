FROM node:lts-alpine as build
WORKDIR /app

COPY package.json ./
RUN npm install --force --legacy-peer-deps

COPY . ./

RUN npm run build


FROM node:lts-alpine as runtime
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./
COPY --from=build /app/package.json ./

ENV NODE_ENV production

EXPOSE 3000/tcp
CMD [ "node",  "index.js" ]
