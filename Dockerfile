FROM oven/bun:1 as base
WORKDIR /app

FROM base AS install
WORKDIR /temp/dev
COPY . .
RUN ls -la
RUN bun install --frozen-lockfile

WORKDIR /temp/prod
COPY . .
RUN ls -la
RUN bun install --frozen-lockfile --production

FROM base AS prerelease
WORKDIR /app
COPY . .
COPY --from=install /temp/dev/node_modules node_modules

ENV NODE_ENV=production

# Build Client
RUN mkdir -p /temp/client
WORKDIR /app/packages/apps/client
RUN bun run build
RUN mv build /temp/client/build
RUN mv package.json /temp/client/package.json
RUN rm -rf ./*
RUN mv /temp/client/* .

FROM base AS release
COPY --from=prerelease /app /app
COPY --from=install /temp/prod/node_modules node_modules

USER bun
EXPOSE 3000/tcp
CMD ["tail", "-f", "/dev/null"]















# FROM oven/bun:1-debian as build

# WORKDIR /app/vivalence

# COPY . .

# RUN bun install --frozen-lockfile

# FROM oven/bun:1-debian as runtime

# WORKDIR /app/vivalence
# COPY --from=build /app/vivalence /app/vivalence

# ENV NODE_ENV production

# USER bun
# EXPOSE 3000/tcp

