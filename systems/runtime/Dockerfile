FROM vivalence/viva:alpine 

WORKDIR /viva/repository

COPY systems/ ./systems/
COPY subsystems/ ./subsystems/
COPY registry/ ./registry/

CMD ["deno", "run", "-A", "systems/runtime/mod.js"]
