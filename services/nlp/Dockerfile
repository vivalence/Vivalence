# Builder stage
# FROM python:3.10.13-slim-bookworm@sha256:25f03d17398b3f001e040fc951b4ee9404862f1b65c5eea1aa31c042dfdab527
FROM mwalbeck/python-poetry:1.7.1-3.10 AS builder
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

WORKDIR /app

COPY pyproject.toml poetry.lock .

RUN poetry --version
RUN poetry install --no-dev --no-root

RUN rm -rf $POETRY_CACHE_DIR

# # Runtime stage
FROM python:3.10-slim

# # Set Environment Variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"


COPY --from=builder /app/.venv ./.venv

WORKDIR /app
ENV PORT=5050
EXPOSE $PORT

COPY . .
# RUN python -c 'import stanza; stanza.download("es")'



CMD ["python", "src/index.py", "$PORT"]
# CMD ["poetry", "run", "python", "src/index.py", "$PORT"]
