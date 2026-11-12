FROM denoland/deno:alpine

RUN apk add --no-cache tesseract-ocr

WORKDIR /app

COPY ./server.js /app/

RUN deno cache server.js
