FROM oven/bun:1-slim as base

WORKDIR /usr/src/app


FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production


FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
RUN bunx vite build
run ls -la
run pwd


FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules 
COPY --from=prerelease /usr/src/app/dist ./

# RUN bun install -g serve

USER bun
EXPOSE 5000/tcp
CMD ["serve"]
# ENTRYPOINT [ "bun", "run", "index.ts" ]


# # FROM refinedev/node:18 AS base
# # FROM base as deps

# # COPY --from=deps /app/refine/node_modules ./node_modules

# # WORKDIR /app

# # COPY package.json ./
# # RUN npm install --force --legacy-peer-deps

# # COPY . ./

# # # RUN apk add --no-cache python3 make g++ \
# #     # && ln -sf python3 /usr/bin/python 

# # # RUN npm install --force --legacy-peer-deps

# # RUN npm run build


# # FROM node:lts-alpine as runtime
# # WORKDIR /app
# # COPY --from=build /app/build ./
# # COPY --from=build /app/package.json ./

# # ENV NODE_ENV production
# # EXPOSE 5000

# # CMD [ "node", "index.js" ]


# # This Dockerfile uses `serve` npm package to serve the static files with node process.
# # You can find the Dockerfile for nginx in the following link:
# # https://github.com/refinedev/dockerfiles/blob/main/vite/Dockerfile.nginx
# FROM refinedev/node:18 AS base

# FROM base as deps

# COPY package.json ./

# FROM base as builder

# ENV NODE_ENV production

# COPY --from=deps /app/refine/node_modules ./node_modules

# COPY . .

# RUN npm run build

# FROM base as runner

# ENV NODE_ENV production

# RUN npm install -g serve

# COPY --from=builder /app/refine/dist ./

# USER refine

# CMD ["serve"]
