#!/bin/bash

# Define different PORT values
PORTS=(5050 5051 5052 5053 5054 5055 5056 5057 5058 5059)

# Loop through the PORTS array and run the Python script with each PORT
for PORT in "${PORTS[@]}"
do
    echo "Running on PORT: $PORT"
    poetry run python src/index.py $PORT &
done

# Wait for all background processes to finish
wait
