import { Application } from "https://deno.land/x/oak@v12.5.0/mod.ts";
import createRouter from "../lib/router.js";
import auth from "./middlewares/auth.js";
import cors from "./middlewares/cors.js";
import supabase from "./middlewares/supabase.js";
import locals from "./middlewares/locals.js";

export default async function server(params) {
  const app = new Application();
  const router = createRouter();

  app.use(cors);
  app.use(locals);
  app.use(supabase);
  app.use(auth);

  return { ...params, app, router };
}
