FROM vivalence/viva:alpine AS capture

WORKDIR /viva/repository
ENV VIVA_SYSTEM_MODE="BUILD"

COPY documentation/ ./documentation/
RUN deno task --cwd documentation capture


FROM denoland/deno:debian AS build

WORKDIR /docs
COPY --from=capture /viva/repository/documentation/ ./
COPY import_map.json ./import_map.json
COPY <<'DENO' ./deno.jsonc
{ "nodeModulesDir": "auto", "importMap": "./import_map.json" }
DENO

RUN deno install
RUN deno run -A npm:astro build
RUN deno run -A npm:pagefind --site dist


FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /docs/dist /usr/share/nginx/html

COPY <<'NGINX' /etc/nginx/conf.d/default.conf
server {
    listen 2020;
    absolute_redirect off;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ =404;
    }
}
NGINX

EXPOSE 2020
