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

