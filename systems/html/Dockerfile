FROM vivalence/viva:alpine 

WORKDIR /viva/repository/systems/html

CMD ["deno", "task", "watch"]

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
