FROM vivalence/viva:alpine 

WORKDIR /viva/repository

# COPY systems/html ./systems/html
# COPY subsystems/ ./subsystems/

ENV VIVA_SYSTEM_MODE="CLIENT"

RUN deno install

CMD ["deno", "task", "html/watch"]

# CMD ["deno", "task", "start"]
# deno task --cwd ./systems/html watch

# //
# FROM viva/shell:latest
# WORKDIR /repository
# COPY config config
# COPY --from=root /build/client/web ./build
# EXPOSE 3000
# CMD ["/start.sh"]
# run ./build

# or:
# RUN viva run daemon lifecycle
# pulls deps and builds, cycles healthchecks and handshakes, ends.
## FROM --root
# RUN viva run daemon daemonize
