ARG VIVA_BASE=vivalence/viva:alpine
FROM ${VIVA_BASE}

RUN apk add --no-cache nginx

WORKDIR /viva/repository
ENV VIVA_SYSTEM_MODE="PRODUCTION" \
    VIVA_SYSTEM_ROLE="CLIENT" \
    VIVA_CLIENT_ANIMA_SERVE=http://0.0.0.0:1794

ARG VIVA_STAMP
ENV VIVA_STAMP=${VIVA_STAMP}

COPY <<'NGINX' /etc/nginx/http.d/default.conf
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
[ -f /viva/repository/systems/anima/build/index.html ] || deno task anima/bundle
exec nginx -g "daemon off;"
ENTRYPOINT
RUN chmod +x /docker-entrypoint.sh

VOLUME /viva/repository/systems/anima/build
EXPOSE 1794
ENTRYPOINT ["/docker-entrypoint.sh"]
