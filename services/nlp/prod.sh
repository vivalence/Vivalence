#!/bin/bash

poetry --version
poetry install --no-root

poetry show

poetry env info

# echo "Pre assign PORT: $PORT"
# PORT=5050
# echo "Running on PORT: $PORT"

# python -c 'import stanza; stanza.download("es")'
poetry run python src/index.py $PORT 

