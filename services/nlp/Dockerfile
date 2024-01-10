# Builder stage
# FROM python:3.10-slim AS builder
FROM mwalbeck/python-poetry

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
RUN poetry --help
RUN poetry install --no-dev

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
