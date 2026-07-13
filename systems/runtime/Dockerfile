FROM vivalence/viva:alpine

WORKDIR /viva/repository
COPY registry/ ./registry/

ENV VIVA_SYSTEM_MODE="RUNTIME"

CMD ["deno", "run", "-A", "systems/runtime/run.js"]
