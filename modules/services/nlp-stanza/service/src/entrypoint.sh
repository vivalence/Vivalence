#!/bin/bash

python download_models.py

exec gunicorn --workers ${GUNICORN_WORKERS} --bind 0.0.0.0:${SERVICE_PORT} --timeout 0 script:app
