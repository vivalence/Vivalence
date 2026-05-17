FROM denoland/deno:alpine

RUN apk add --no-cache \
    bash \
    git \
    jujutsu \
    curl \
    ca-certificates \
    openssh-client \
    libgcc \
    libstdc++ \
    sqlite

RUN apk add --no-cache \
    bat \
    ripgrep \
    fd \
    fzf \
    vim \
    micro

RUN apk add --no-cache \
    tmux \
    htop \
    jq \
    ranger

RUN apk add --no-cache \
    docker-cli \
    docker-cli-compose

RUN rm -f /usr/local/lib/libgcc_s.so.1

RUN cat >> /root/.bashrc <<'EOF'
export EDITOR=vim VISUAL=vim
export PATH="/root/.deno/bin:$PATH"
alias e=vim em="emacs -nw"
alias j=jj
alias cat=bat find=fd grep=rg
alias tm=tmux
EOF

WORKDIR /viva/repository

COPY deno.jsonc import_map.json ./
COPY systems/ ./systems/
COPY subsystems/ ./subsystems/
COPY registry/ ./registry/

RUN deno install --allow-scripts=npm:sqlite3,npm:svelte-preprocess
RUN deno install --entrypoint ./systems/shell/mod.js ./systems/runtime/run.js
# RUN deno install --global --config ./deno.jsonc -f -A -n viva ./systems/shell/mod.js

RUN mkdir -p /root/.deno/bin && \
    printf '#!/bin/sh\ncd /viva/repository && exec deno run -A ./systems/shell/mod.js "$@"\n' \
    > /root/.deno/bin/viva && \
    chmod +x /root/.deno/bin/viva

ENV PATH="/root/.deno/bin:$PATH"
ENV VIVA_REPOSITORY_MOUNT=/viva/repository
ENV VIVA_REGISTRY_MOUNT=/viva/repository/registry

CMD ["bash"]

# FROM denoland/deno:alpine 

# RUN apk add --no-cache \
#     bash \
#     git \
#     jujutsu \ 
#     curl \
#     ca-certificates \
#     openssh-client \
#     libgcc \
#     libstdc++

# # Build tools (for cargo installs)
# RUN apk add --no-cache \
#     build-base \
#     cargo \
#     rust

# # Core CLI tools (apk available)
# RUN apk add --no-cache \
#     bat \
#     ripgrep \
#     fd \
#     fzf \
#     vim \
#     micro

# # Extended CLI tools (apk available) 
# RUN apk add --no-cache \
#     tmux \
#     htop \
#     jq \
#     ranger

# # RUN apk add --no-cache emacs-nox

# # Container tools
# RUN apk add --no-cache \
#     docker-cli \
#     docker-cli-compose

# # Essential Rust tools
# # ENV PATH="/root/.cargo/bin:${PATH}"

# # RUN cargo install --locked  jj-cli
#     # \ starship zoxide

# # Extended Rust tools
# # RUN cargo install --locked \
# #     eza \
# #     procs \
# #     bottom \
# #     dust

# # Luxury Rust tools  
# # RUN cargo install --locked \
# #     tealdeer \
# #     git-delta \
# #     hexyl \
# #     helix

# # Cleanup build tools
# RUN rm -rf /root/.cargo/registry /root/.cargo/git && \
#     apk del build-base cargo rust

# # Shell configuration
# RUN cat >> /root/.bashrc <<'EOF'
# # eval "$(starship init bash)"
# # eval "$(zoxide init bash)"
# export EDITOR=vim VISUAL=vim
# alias e=vim em="emacs -nw"
# alias j=jj
# alias cat=bat find=fd grep=rg
# alias tm=tmux
# EOF

# # FROM vivalence/foundation:alpine

# WORKDIR /viva/repository

# COPY deno.jsonc import_map.json ./
# COPY systems/ ./systems/
# COPY subsystems/ ./subsystems/
# COPY registry/ ./registry/

# RUN echo 'export * from "./systems/runtime/mod.js";' > deps.js && \
#     echo 'export * from "./systems/shell/mod.js";' >> deps.js

# RUN deno cache --import-map=import_map.json deps.js
# RUN deno task install

# ENV VIVA_REPOSITORY_MOUNT=/viva/repository
# ENV VIVA_REGISTRY_MOUNT=/viva/repository/registry

# # CMD ["tail", "-f", "/dev/null"]
# CMD ["bash"]


# # FROM denoland/deno:alpine

# # WORKDIR /viva/foundation

# # RUN apk add --no-cache \
# #     bash \
# #     git \
# #     jujutsu \ 
# #     curl \
# #     ca-certificates \
# #     openssh-client \
# #     libgcc \
# #     libstdc++

# # # Build tools (for cargo installs)
# # RUN apk add --no-cache \
# #     build-base \
# #     cargo \
# #     rust

# # # Core CLI tools (apk available)
# # RUN apk add --no-cache \
# #     bat \
# #     ripgrep \
# #     fd \
# #     fzf \
# #     vim \
# #     micro

# # # Extended CLI tools (apk available) 
# # RUN apk add --no-cache \
# #     tmux \
# #     htop \
# #     jq \
# #     ranger

# # # RUN apk add --no-cache emacs-nox

# # # Container tools
# # RUN apk add --no-cache \
# #     docker-cli \
# #     docker-cli-compose

# # # Essential Rust tools
# # # ENV PATH="/root/.cargo/bin:${PATH}"

# # # RUN cargo install --locked  jj-cli
# #     # \ starship zoxide

# # # Extended Rust tools
# # # RUN cargo install --locked \
# # #     eza \
# # #     procs \
# # #     bottom \
# # #     dust

# # # Luxury Rust tools  
# # # RUN cargo install --locked \
# # #     tealdeer \
# # #     git-delta \
# # #     hexyl \
# # #     helix

# # # Cleanup build tools
# # RUN rm -rf /root/.cargo/registry /root/.cargo/git && \
# #     apk del build-base cargo rust

# # # Shell configuration
# # RUN cat >> /root/.bashrc <<'EOF'
# # # eval "$(starship init bash)"
# # # eval "$(zoxide init bash)"
# # export EDITOR=vim VISUAL=vim
# # alias e=vim em="emacs -nw"
# # alias j=jj
# # alias cat=bat find=fd grep=rg
# # alias tm=tmux
# # EOF


# # WORKDIR /viva/repository

# # COPY deno.jsonc import_map.json ./
# # COPY systems/ ./systems/
# # COPY subsystems/ ./subsystems/
# # COPY registry/ ./registry/

# # RUN echo 'export * from "./systems/runtime/mod.js";' > deps.js && \
# #     echo 'export * from "./systems/shell/mod.js";' >> deps.js

# # RUN deno cache --import-map=import_map.json deps.js
# # RUN deno task install

# # RUN mkdir /viva/variant
# # RUN mkdir /viva/mountpoint
# # RUN mkdir /viva/registry

# # ENV VIVA_REPOSITORY_MOUNT=/viva/repository

# # # CMD ["tail", "-f", "/dev/null"]

# # CMD ["bash"]

