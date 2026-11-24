# syntax=docker/dockerfile:1
ARG VIVA_BASE=vivalence/viva:alpine
FROM ${VIVA_BASE} AS viva

FROM denoland/deno:debian

RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx \
    && rm -rf /var/lib/apt/lists/* /etc/nginx/sites-enabled/default

WORKDIR /viva/repository

COPY deno.jsonc deno.lock import_map.json ./
COPY systems/runtime/deno.jsonc ./systems/runtime/deno.jsonc
COPY systems/anima/deno.jsonc ./systems/anima/deno.jsonc
COPY systems/ghost/deno.jsonc ./systems/ghost/deno.jsonc
COPY subsystems/typology/deno.jsonc ./subsystems/typology/deno.jsonc
COPY subsystems/paladin/deno.jsonc ./subsystems/paladin/deno.jsonc
COPY subsystems/dapper/deno.jsonc ./subsystems/dapper/deno.jsonc
COPY subsystems/drapes/deno.jsonc ./subsystems/drapes/deno.jsonc
COPY subsystems/sheets/deno.jsonc ./subsystems/sheets/deno.jsonc
COPY documentation/deno.jsonc ./documentation/deno.jsonc

RUN deno install --allow-scripts=npm:better-sqlite3,npm:argon2,npm:svelte-preprocess

COPY --from=viva --exclude=repository/node_modules /viva /viva

ENV VIVA_REPOSITORY_MOUNT=/viva/repository \
    VIVA_LEDGER_MOUNT=/viva/ledger \
    VIVA_REGISTRY_MOUNT=/viva/ledger/registry \
    VIVA_SYSTEM_MODE="PRODUCTION" \
    VIVA_SYSTEM_ROLE="CLIENT" \
    VIVA_CLIENT_ANIMA_SERVE=http://0.0.0.0:1794

ARG VIVA_STAMP
ENV VIVA_STAMP=${VIVA_STAMP}

COPY <<'NGINX' /etc/nginx/conf.d/default.conf
server {
    listen 1794;
    root /viva/repository/systems/anima/build;
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    location / {
        try_files $uri /index.html;
        add_header Cache-Control "no-cache";
    }
}
NGINX

COPY <<'ENTRYPOINT' /docker-entrypoint.sh
#!/bin/sh
set -eu
deno task anima/bundle
exec nginx -g "daemon off;"
ENTRYPOINT
RUN chmod +x /docker-entrypoint.sh

VOLUME /viva/repository/systems/anima/build
EXPOSE 1794
ENTRYPOINT ["/docker-entrypoint.sh"]
