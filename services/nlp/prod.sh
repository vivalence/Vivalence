#!/bin/bash

poetry --version
poetry install --no-root

# stanza = "^1.7.0"
# fastapi = "^0.108.0"
# uvicorn = "^0.25.0"
# pydantic = "^2.5.3"

poetry add stanza
poetry add fastapi
poetry add uvicorn
poetry add pydantic

poetry show

poetry env info

# echo "Pre assign PORT: $PORT"
# PORT=5050
# echo "Running on PORT: $PORT"

# python -c 'import stanza; stanza.download("es")'
poetry run python src/index.py $PORT 

