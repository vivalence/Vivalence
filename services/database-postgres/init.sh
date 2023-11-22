#!/bin/bash

# Load the environment variables from .env.postgres
source .env.postgres


# Create the role in PostgreSQL
docker exec -it postgres psql -U postgres -c "CREATE ROLE $POSTGRES_USER WITH LOGIN PASSWORD '$POSTGRES_PASSWORD';"

# Create the database in PostgreSQL
docker exec -it postgres psql -U postgres -c "CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER;"

# ALTER ROLE username WITH SUPERUSER;
# ALTER DATABASE vivalence_com_spanish_v0_3 OWNER TO admin_com_vivalence;


# # Create the role in PostgreSQL
# docker exec -it postgres psql -U $POSTGRES_USER -c "CREATE ROLE $POSTGRES_USER WITH LOGIN PASSWORD '$POSTGRES_PASSWORD';"

# # Create the database in PostgreSQL
# docker exec -it postgres psql -U $POSTGRES_USER -c "CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER;"
