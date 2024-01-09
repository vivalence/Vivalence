# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install Poetry
RUN pip install poetry

# Install any needed packages specified in pyproject.toml
RUN poetry config virtualenvs.create false
RUN poetry install --no-dev

# Define environment variable
ENV PORT=5050

EXPOSE $PORT

# Define command to run the app when the container launches
CMD ["poetry", "run", "python", "src/index.py", "$PORT"]
