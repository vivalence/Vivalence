#!/bin/bash
# i fucking hate HATTEEEE!!! python

# poetry --version
poetry install --no-root

# stanza = "^1.7.0"
# fastapi = "^0.108.0"
# uvicorn = "^0.25.0"
# pydantic = "^2.5.3"

source /app/.venv/bin/activate

pip install stanza
pip install fastapi
pip install uvicorn
pip install pydantic

# poetry show

# poetry env info

# echo "Pre assign PORT: $PORT"
# PORT=5050
# echo "Running on PORT: $PORT"

# python -c 'import stanza; stanza.download("es")'
python src/index.py $PORT 

