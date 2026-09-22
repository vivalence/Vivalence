# readme-walk — a fresh machine, every fence captured

1. **who is listening** — `lsof -i -P | grep LISTEN` over ALL processes AND `docker ps`.
- alt ports for the walk (`:2501`/`:1794` are the local instance's); name them in the report.
6. **kill the bodies** — `docker rm -f <names>`; list them in the report.
7. **free the port** — `kill $(lsof -ti:2501 -sTCP:LISTEN)`; clients hold sockets on the port too, only the listener is the runtime.
