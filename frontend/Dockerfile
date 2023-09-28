FROM node:lts-alpine as build

WORKDIR /app
COPY package.json ./
RUN npm install

COPY . ./

ENV NODE_ENV=production 
RUN npm run build

FROM nginx:alpine
COPY --from=build /app /usr/share/nginx/html
EXPOSE 80

