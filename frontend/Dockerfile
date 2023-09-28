FROM node:lts-alpine as build


WORKDIR /app

COPY package.json ./
# COPY package-lock.json ./
# RUN npm i -g vite
RUN npm install

COPY . ./

ENV NODE_ENV=production 
RUN npm run build


# FROM node:19-alpine3.16
FROM nginx:alpine

# Copy dist folder to nginx folder
COPY --from=build /app /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# ENV HOST=0.0.0.0
# EXPOSE 4173
# CMD ["npm","run", "preview","--", "--host", "0.0.0.0"]

