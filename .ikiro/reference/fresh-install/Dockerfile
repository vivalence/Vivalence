FROM ubuntu:24.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates unzip git sqlite3 && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y --no-install-recommends vim ranger && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://deno.land/install.sh | sh -s -- -y
ENV PATH="/root/.deno/bin:$PATH"
WORKDIR /viva/repository
COPY deno.jsonc deno.lock import_map.json ./
COPY systems/ ./systems/
COPY subsystems/ ./subsystems/
COPY commons/ ./commons/
COPY documentation/deno.jsonc ./documentation/deno.jsonc
RUN deno task embed
CMD ["sleep", "infinity"]
