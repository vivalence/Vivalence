import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import cors from "./middlewares/cors.js";
import auth from "./middlewares/auth.js";
import createRouter from "../lib/router/create.js";

export default async function server(params) {
  const app = new Application();
  const router = createRouter();

  app.use(cors);
  app.use(auth);

  return { ...params, app, router };
}
