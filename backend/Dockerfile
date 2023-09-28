FROM oven/bun

ENV NODE_ENV production
WORKDIR /app

COPY package*.json bun.lockb ./
RUN bun install
COPY . .

RUN bun run prisma-generate

EXPOSE 4000
CMD [ "bun", "start" ]
