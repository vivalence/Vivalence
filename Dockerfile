FROM denoland/deno:alpine

WORKDIR /viva/repository
ENV VIVA_REPOSITORY_DIR="/viva/repository"

COPY deno.jsonc import_map.json ./
COPY systems/ ./systems/
COPY subsystems/ ./subsystems/
COPY register/ ./register/

RUN echo 'export * from "./systems/daemon/mod.ts";' > deps.ts && \
    echo 'export * from "./systems/clients/shell/mod.js";' >> deps.ts

RUN deno cache --import-map=import_map.json deps.ts

RUN deno task install

CMD ["tail", "-f", "/dev/null"]

# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#     CMD deno run -A -c deno.jsonc -r ./systems/clients/shell/healthcheck.js || exit 1
