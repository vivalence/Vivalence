import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import cors from "./middlewares/cors.js";
import auth from "./middlewares/auth.js";
import createRouter from "./createRouter.js";

export default async function server(params) {
  const app = new Application();
  const router = createRouter();

  app.use(cors);
  app.use(auth);

  router.all("/status", (ctx) => {
    ctx.response.body = { status: "ok" };
  });

  return { ...params, app, router };
}
