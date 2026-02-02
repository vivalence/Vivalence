#!/bin/bash

python -c "from server import init_models; init_models()"

exec gunicorn --workers ${SERVICE_WORKERS} --bind 0.0.0.0:${SERVICE_PORT} --timeout 0 server:app
