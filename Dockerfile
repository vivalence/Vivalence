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
WORKDIR /app/packages/apps/client
RUN bun run build
RUN find . -mindepth 1 -maxdepth 1 ! -name 'build' ! -name 'package.json' -exec rm -rf {} +
RUN sed -i '/performance.markResourceTiming/d' /app/packages/apps/client/build/shims.js

FROM base AS release
COPY --from=prerelease /app /app
COPY --from=install /temp/prod/node_modules node_modules

# USER bun
EXPOSE 3000/tcp
CMD ["tail", "-f", "/dev/null"]

