FROM denoland/deno:alpine

WORKDIR /viva/repository

COPY deno.jsonc import_map.json ./
COPY systems/ ./systems/
COPY subsystems/ ./subsystems/
COPY registry/ ./registry/

RUN echo 'export * from "./systems/runtime/mod.js";' > deps.js && \
    echo 'export * from "./systems/shell/mod.js";' >> deps.js

RUN deno cache --import-map=import_map.json deps.js
RUN deno task install

ENV VIVA_SYSTEM_MOUNT=/viva/repository

CMD ["tail", "-f", "/dev/null"]

