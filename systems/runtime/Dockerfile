FROM vivalence/vivalence:alpine

WORKDIR /viva/repository

COPY systems/ ./systems/
COPY subsystems/ ./subsystems/
COPY registry/ ./registry/

ENV VIVA_SYSTEM_MODE="RUNTIME"

CMD ["deno", "run", "-A", "systems/runtime/run.js"]
