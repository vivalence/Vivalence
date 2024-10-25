# Use an official Python runtime as a parent image
FROM python:3.8

# Set the working directory to /app
WORKDIR /app

# Install any needed packages specified in requirements.txt
RUN apt-get update && \
    apt-get install -y  \
    --no-install-recommends \
    build-essential \
    cmake \
    wget \
    git \
    vim \
    libev-dev \ 
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*



RUN pip install --upgrade pip

RUN git clone https://github.com/stanfordnlp/stanza.git
WORKDIR /app/stanza

RUN pip install -e .

RUN pip install Flask bjoern 
# RUN pip install gunicorn asyncio aiohttp 

# Copy the current directory contents into the container at /app/stanza
WORKDIR /app/stanza

EXPOSE 5000

COPY . /app/stanza

# Run script.py when the container launches
# CMD ["/usr/local/bin/gunicorn","-w","1","-b","0.0.0.0:5000","--timeout","0", "-k", "sync","script:app"]

CMD ["python", "script.py"]


# CMD ["/usr/local/bin/gunicorn", \
#      "-b", "0.0.0.0:5000", \
#      "--timeout", "0", \
#      "-k", "sync", \
#      "script:app"]
