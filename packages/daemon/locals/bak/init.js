import { Application } from "oak";
import auth from "./middlewares/auth.js";
import cors from "./middlewares/cors.js";

import createRouter from "./router/create.js";

export default async function server(daemon) {
  daemon.abort = new AbortController();
  daemon.server = new Application();
  daemon.router = createRouter();
  daemon.server.use(cors);
  daemon.server.use(auth);

  daemon.router.use(async (ctx, next) => {
    // trace Entry:
    // console.log(ctx.request.url.pathname);
    await next();
  });

  return daemon;
}
