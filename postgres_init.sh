#!/bin/bash

# Load the environment variables from .env.postgres
source .env.postgres


# Create the role in PostgreSQL
docker exec -it postgres psql -U postgres -c "CREATE ROLE $POSTGRES_USER WITH LOGIN PASSWORD '$POSTGRES_PASSWORD';"

# Create the database in PostgreSQL
docker exec -it postgres psql -U postgres -c "CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER;"


# # Create the role in PostgreSQL
# docker exec -it postgres psql -U $POSTGRES_USER -c "CREATE ROLE $POSTGRES_USER WITH LOGIN PASSWORD '$POSTGRES_PASSWORD';"

# # Create the database in PostgreSQL
# docker exec -it postgres psql -U $POSTGRES_USER -c "CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER;"
