#!/bin/bash

poetry --version
poetry install --no-dev --no-root

rm -rf /tmp/poetry_cache

PORT=5050
echo "Running on PORT: $PORT"

poetry run python src/index.py $PORT &

