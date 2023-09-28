FROM node:lts-alpine 

ENV NODE_ENV production
WORKDIR /app

# COPY package*.json bun.lockb ./
COPY package*.json ./
RUN npm install
# RUN bun run prisma-generate
COPY . .

EXPOSE 4000
CMD [ "npm", "run", "start" ]
