FROM vivalence/viva:latest AS root

WORKDIR /repository
COPY config config

RUN viva run build client web
# for caching, mount nodemodules and register

# or:
# RUN viva run daemon lifecycle
# pulls deps and builds, cycles healthchecks and handshakes, ends.

FROM vivalence/alpine
WORKDIR /repository
COPY config config
COPY --from=root /build/client/web ./build
# EXPOSE 3000
# CMD ["/start.sh"]
# run ./build

# RUN viva run daemon daemonize
