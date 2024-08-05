const start = performance.now();
import supabase from "../lib/supabase/index.js";
import getRuntimeModules from "../lib/viva/module-loader.js";
import config from "@vivalence/config";

import createRouter from "../lib/router/create.js";
import createEmitter from "./lib/createEmitter.js";
import boot from "./lib/boot.js";
import ensure from "./lib/ensure.js";
import connect from "./lib/connect.js";

export default async function runtimes({ services, supabase, ...params }) {
  const Runtimes = await getRuntimeModules(config.env.get("VIVA_RUNTIMES_DIR"));
  const runtimes = new Map();

  function middlewares(runtime) {
    runtime.bus.use(async (ctx, next) => {
      ctx.runtime = runtimes.get(runtime["#symbol"]);
      ctx.runtime.locals.supabase = supabase.createAdminClient();
      ctx.runtime.call = runtime.caller(ctx);
      await next();
    });

    runtime.router.use(async (ctx, next) => {
      ctx.runtime = runtimes.get(runtime["#symbol"]);

      if (!ctx.runtime.locals.supabase) {
        ctx.runtime.locals.supabase = supabase.createUserClient(ctx.runtime);
      }

      ctx.runtime.call = runtime.caller(ctx);
      await next();
    });
  }

  for (const { Domain, Ontology, Corpus, Games, Runtime } of Runtimes.values()) {
    const locals = { supabase: supabase.createAdminClient(), services };

    let runtime = {
      ...(await ensure(Runtime, { locals })),
      ["#symbol"]: Symbol(Runtime.manifest.type),
      privileges: "ELEVATED",
      bus: createEmitter(),
      router: createRouter(),
      schema: [Ontology, Corpus].reduce((a, { schema: s }) => s(a), {}),
      locals,
    };

    middlewares(runtime);

    runtime = await Runtime.boot(runtime, { Module: Runtime, manifest: runtime.manifest });
    runtime.Module = Runtime;
    runtime.domain = await boot(Domain, runtime);
    runtime.ontology = await boot(Ontology, runtime);
    runtime.corpus = await boot(Corpus, runtime);
    runtime.games = await Promise.all(Games.values().map((G) => boot(G, runtime)));

    await connect(runtime);
    runtime.caller = runtime.router.caller(runtime);

    runtimes.set(runtime["#symbol"], runtime);
  }

  return { ...params, runtimes };
}
