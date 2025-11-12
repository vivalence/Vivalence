FROM vivalence/viva:alpine 

ENV VIVA_SYSTEM_MODE="CLIENT"

WORKDIR /viva/repository

COPY systems/ ./systems/
COPY subsystems/ ./subsystems/

WORKDIR /viva/repository/systems/html

CMD ["deno", "task", "start"]

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
