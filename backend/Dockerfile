FROM oven/bun

WORKDIR /app

COPY package*.json bun.lockb ./
RUN bun install
COPY . .

ENV NODE_ENV production
EXPOSE 4000

CMD [ "bun", "start" ]
