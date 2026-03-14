FROM vivalence/viva:alpine

WORKDIR /viva/repository

COPY import_map.json ./import_map.json
COPY systems/html/svelte.config.js ./systems/html/svelte.config.js
COPY systems/html/vite.config.mjs ./systems/html/vite.config.mjs
COPY systems/html/serve.js ./systems/html/serve.js

RUN deno install
RUN deno task html/bundle

EXPOSE 1794

CMD ["deno", "run", "-A", "systems/html/serve.js"]
