FROM vivalence/viva:latest AS root
WORKDIR /viva/repository

# COPY system/daemon/ ./system/daemon/
# RUN deno cache system/daemon/mod.ts
# RUN viva run build daemon || echo "No build step required"

EXPOSE 5175

# CMD ["viva", "variant", "daemon", "start"]
CMD ["deno", "run", "-A", "system/daemon/mod.ts"]

# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#     CMD curl -f http://localhost:5175/health || exit 1
