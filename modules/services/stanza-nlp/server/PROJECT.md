## Project Briefing: Dockerized API Service for Stanza NLP Library

### Objective
Develop a Dockerized API service that integrates the Stanza Natural Language Processing (NLP) library. The service should be able to process JSON input, execute Stanza functions, and return JSON output.

### Key Features

- [X] **Docker Image**
  - Create a Docker image containing a Flask application and the Stanza library.

- [x] **API Functionality**
  - The API should accept JSON input, utilize the Stanza library for NLP processing, and return JSON output.

- [x] **Customization**
  - Allow environment variable settings for language selection (e.g., Spanish, English, German) and Stanza processors.

- [x] **Automated Build & Deployment**
  - Set up a GitHub Action for building the Docker image and publishing it to Docker Hub.

- [X] **Integration**
  - Ensure compatibility with Docker Compose for easy integration into existing setups.

### Success Criteria
- The container, when run, should be accessible via an endpoint and capable of processing and responding to JSON requests as per the specified configurations.

