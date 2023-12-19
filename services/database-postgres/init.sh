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

#!/bin/bash

# Create the 'postgres' role in PostgreSQL
create_postgres_role() {
  psql -d postgres -c "CREATE ROLE admin WITH SUPERUSER CREATEDB CREATEROLE LOGIN ENCRYPTED PASSWORD 'password';"

}

# Check if psql command is available
if command -v psql > /dev/null; then
  create_postgres_role
else
  echo "psql command not found. Make sure PostgreSQL is installed and available in PATH."
fi
