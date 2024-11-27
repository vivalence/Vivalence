import { Application, Router } from "oak";
import cors from "./middlewares/cors.js";
import auth from "./middlewares/auth.js";

import createRouter from "./router/create.js";

export default async function server(daemon) {
  daemon.abort = new AbortController();
  daemon.server = new Application();
  daemon.router = createRouter();
  daemon.server.use(cors);
  daemon.server.use(auth);
  return daemon;
}
