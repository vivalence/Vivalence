# Builder stage
FROM python:3.10.13-slim-bookworm@sha256:25f03d17398b3f001e040fc951b4ee9404862f1b65c5eea1aa31c042dfdab527

# renovate: datasource=pypi depName=poetry versioning=semver
ENV POETRY_VERSION 1.7.1

RUN set -ex; pip install --no-cache-dir poetry==$POETRY_VERSION;

# FROM python:3.10-slim AS builder
# FROM mwalbeck/python-poetry:latest

# # Install Poetry
# RUN pip install poetry==1.7.0

# # Set Environment Variables for Poetry
# ENV POETRY_NO_INTERACTION=1 \
#     POETRY_VIRTUALENVS_IN_PROJECT=1 \
#     POETRY_VIRTUALENVS_CREATE=1 \
#     POETRY_CACHE_DIR=/tmp/poetry_cache

# Set Working Directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml poetry.lock .

# Install dependencies
RUN poetry --version
RUN poetry install --no-dev --no-root

# # Remove Poetry Cache
# RUN rm -rf $POETRY_CACHE_DIR

# # Runtime stage
# FROM python:3.10-slim

# # Set Environment Variables
# ENV PYTHONDONTWRITEBYTECODE=1 \
#     PYTHONUNBUFFERED=1 \
#     PATH="/app/.venv/bin:$PATH"

# # Set Working Directory
# WORKDIR /app

# Copy the virtual environment from builder stage
# COPY --from=builder /app/.venv ./.venv

# Copy application code
COPY . .

# Set Environment Variable for Port
ENV PORT=5050

# Expose Port
EXPOSE $PORT

# Command to run the application
CMD ["poetry", "run", "python", "src/index.py", "$PORT"]
