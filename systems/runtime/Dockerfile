FROM vivalence/viva:alpine

WORKDIR /viva/repository
COPY commons/ ./commons/

RUN deno cache systems/runtime/run.js

ENV VIVA_SYSTEM_MODE="PRODUCTION" \
    VIVA_SYSTEM_ROLE="RUNTIME" \
    VIVA_MOUNTPOINT_MOUNT=/viva/mountpoint \
    VIVA_RUNTIME_ORIGIN=http://0.0.0.0:2501

VOLUME /viva/mountpoint
EXPOSE 2501

CMD ["deno", "run", "-A", "systems/runtime/run.js"]
