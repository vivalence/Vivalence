ARG VIVA_BASE=vivalence/viva:alpine
FROM ${VIVA_BASE} AS build

WORKDIR /viva/repository
ENV VIVA_SYSTEM_MODE="BUILD"
ENV VIVA_SYSTEM_ROLE="CLIENT"

RUN rm -rf \
    ./registry \
    ./systems/kajuit \
    ./subsystems/typology \
    ./subsystems/dapper \
    ./subsystems/drapes \
    ./subsystems/paladin

COPY deno.jsonc import_map.json ./
COPY systems/runtime/deno.jsonc ./systems/runtime/deno.jsonc
COPY systems/kajuit/deno.jsonc ./systems/kajuit/deno.jsonc
COPY systems/ghost/deno.jsonc ./systems/ghost/deno.jsonc
COPY subsystems/typology/deno.jsonc ./subsystems/typology/deno.jsonc
COPY subsystems/paladin/deno.jsonc ./subsystems/paladin/deno.jsonc
COPY subsystems/dapper/deno.jsonc ./subsystems/dapper/deno.jsonc
COPY subsystems/drapes/deno.jsonc ./subsystems/drapes/deno.jsonc
COPY subsystems/sheets/deno.jsonc ./subsystems/sheets/deno.jsonc
COPY documentation/deno.jsonc ./documentation/deno.jsonc

RUN deno install

COPY registry/ ./registry/
COPY subsystems/typology/ ./subsystems/typology/
COPY subsystems/dapper/ ./subsystems/dapper/
COPY subsystems/drapes/ ./subsystems/drapes/
COPY subsystems/paladin/ ./subsystems/paladin/
COPY systems/kajuit/ ./systems/kajuit/

ARG VIVA_STAMP
ENV VIVA_STAMP=${VIVA_STAMP}
RUN deno task kajuit/bundle

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /viva/repository/systems/kajuit/build /usr/share/nginx/html

COPY <<'NGINX' /etc/nginx/conf.d/default.conf
server {
    listen 1794;
    root /usr/share/nginx/html;
    location / {
        try_files $uri /200.html;
    }
}
NGINX

COPY <<'ENTRYPOINT' /docker-entrypoint.sh
#!/bin/sh
ENV_JSON="{"
FIRST=true
for var in $(env | grep "^PUBLIC_VIVA_" | sort); do
  key="${var%%=*}"
  value="${var#*=}"
  if [ "$FIRST" = true ]; then FIRST=false; else ENV_JSON="${ENV_JSON},"; fi
  ENV_JSON="$ENV_JSON\"$key\":\"$value\""
done
ENV_JSON="$ENV_JSON}"
echo "export const env=$ENV_JSON" > /usr/share/nginx/html/_app/env.js
exec nginx -g "daemon off;"
ENTRYPOINT

RUN chmod +x /docker-entrypoint.sh

EXPOSE 1794
ENTRYPOINT ["/docker-entrypoint.sh"]
