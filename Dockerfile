FROM denoland/deno:alpine

WORKDIR /viva/repository
ENV VIVA_REPOSITORY_DIR="/viva/repository"

COPY deno.jsonc import_map.json ./
COPY system/ ./system/
COPY packages/ ./packages/

RUN deno cache --import-map=import_map.json deps.ts
RUN deno task deno:install
RUN deno task viva:install

# ENTRYPOINT ["viva"]
CMD ["tail", "-f", "/dev/null"]

# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#   CMD deno run -A ./healthcheck.js

# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:3000/health || exit 1
