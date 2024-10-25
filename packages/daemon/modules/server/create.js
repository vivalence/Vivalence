import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import cors from "./middlewares/cors.js";
import auth from "./middlewares/auth.js";

import createRouter from "./router/create.js";

export default async function server(daemon) {
  daemon.abort = new AbortController();
  daemon.app = new Application();
  daemon.router = createRouter();

  daemon.app.use(cors);
  daemon.app.use(auth);

  return daemon;
}
