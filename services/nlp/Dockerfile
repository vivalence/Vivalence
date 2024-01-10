FROM mwalbeck/python-poetry:1.7.1-3.10 AS builder

ENV POETRY_NO_INTERACTION=1 
#     POETRY_VIRTUALENVS_IN_PROJECT=1 \
#     POETRY_VIRTUALENVS_CREATE=1 \
#     PATH="/app/.venv/bin:$PATH"

ENV POETRY_VIRTUALENVS_CREATE=false



RUN apt-get update && apt-get install -y bash \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml poetry.lock ./

COPY . .

ENV PORT=5050
EXPOSE $PORT

RUN ls -la
CMD ["bash", "./prod.sh"]

# CMD ["poetry", "run", "python", "src/index.py", "$PORT"]
# CMD ["python", "src/index.py", "$PORT"]


# COPY pyproject.toml poetry.lock .

# RUN poetry --version
# RUN poetry install --no-dev --no-root


# # # Runtime stage
# FROM python:3.10-slim

# # # Set Environment Variables
# ENV PYTHONDONTWRITEBYTECODE=1 \
#     PYTHONUNBUFFERED=1 \
#     PATH="/app/.venv/bin:$PATH"


# COPY --from=builder /app/.venv ./.venv

# WORKDIR /app
