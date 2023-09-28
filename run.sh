#!/bin/bash

docker run -e DATABASE_URL="postgresql://admin:password@host.docker.internal:5432/valence-spanish" v-backend

docker run -e PUBLIC_GQL_SERVER_API_URL="http://host.docker.internal:4000" v-frontend

