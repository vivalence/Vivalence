FROM python:3.10-buster 

RUN pip install poetry==1.7.0

ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

WORKDIR /app

COPY pyproject.toml poetry.lock ./
RUN touch README.md

RUN poetry install --no-dev --no-root
RUN rm -rf $POETRY_CACHE_DIR

# The runtime image, used to just run the code provided its virtual environment

ENV VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH"

COPY . /app

ENV PORT=5050

EXPOSE $PORT
CMD ["poetry", "run", "python", "src/index.py", "$PORT"]








# # Use an official Python runtime as a parent image
# FROM python:3.10-slim

# # Set the working directory in the container

# # Copy the current directory contents into the container at /usr/src/app
# COPY . .

# # Install Poetry
# RUN pip install poetry

# # Install any needed packages specified in pyproject.toml
# RUN poetry config virtualenvs.create false
# RUN poetry install --no-dev

# # Define environment variable
