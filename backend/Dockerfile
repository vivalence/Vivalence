FROM node:lts-alpine 

ENV NODE_ENV production
WORKDIR /app

# COPY package*.json bun.lockb ./
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run prisma-generate

EXPOSE 4000
CMD [ "npm", "run", "start" ]
