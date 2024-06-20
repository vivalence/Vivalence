FROM ghcr.io/vivalence/base:latest as base
ENV NODE_ENV=production



FROM base as build
COPY . .
COPY --from=base /temp/dev/node_modules node_modules

WORKDIR /app/packages/apps/client
RUN bun run build
RUN find . -mindepth 1 -maxdepth 1 ! -name 'build' ! -name 'package.json' -exec rm -rf {} +
RUN sed -i '/performance.markResourceTiming/d' /app/packages/apps/client/build/shims.js



FROM base AS release
COPY --from=build /app /app
COPY --from=base /temp/prod/node_modules node_modules

# USER bun
EXPOSE 3000/tcp
CMD ["tail", "-f", "/dev/null"]

