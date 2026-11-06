ARG VIVA_BASE=vivalence/viva:alpine
FROM ${VIVA_BASE} AS viva

FROM denoland/deno:debian

RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx \
    && rm -rf /var/lib/apt/lists/* /etc/nginx/sites-enabled/default

COPY --from=viva /deno-dir /deno-dir
COPY --from=viva /viva /viva

WORKDIR /viva/repository
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
