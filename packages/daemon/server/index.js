import { Application } from "https://deno.land/x/oak@v12.5.0/mod.ts";
import createRouter from "../lib/router.js";
import auth from "./middlewares/auth.js";
import supabase from "./middlewares/supabase.js";
import { cors } from "./middlewares/cors.js";

export default async function server(params) {
  const app = new Application();
  const router = createRouter();

  // app.use(cors);
  // app.use(supabase);
  // app.use(auth);

  const simpleMiddleware = async (ctx, next) => {
    console.log("[CUSTOM] simpleMiddleware start");
    await next();
    console.log("[CUSTOM] simpleMiddleware end");
  };

  // Use the simple middleware instead of CORS to test
  router.use(simpleMiddleware);
  router.use(cors);
  // router.use(supabase);
  // router.use(auth);

  router.route("/status", (ctx) => {
    console.log("[ROUTE /status] called");
    ctx.response.body = { status: "ok" };
  });

  return { ...params, app, router };
}
