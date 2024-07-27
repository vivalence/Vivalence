import supabase from "../lib/supabase/index.js";
import getRuntimeModules from "../lib/viva/module-loader.js";
import config from "@vivalence/config";

import createRouter from "../server/createRouter.js";
import createEmitter from "./lib/createEmitter.js";
import { connect, ensure } from "./lib/install.js";

async function boot(Module, runtime) {
  const type = Module.manifest.type.toLowerCase();
  const bus = runtime.bus.scope(`@${type}`);
  const router = createRouter();
  const { manifest } = await ensure(Module, runtime.locals);
  return await Module.boot({ ...runtime, manifest, router, bus, Module });
}

function middlewares(runtime, runtimes, supabase) {
  runtime.router.use(async (ctx, next) => {
    ctx.runtime = runtimes.get(runtime.symbol);
    ctx.runtime.locals.supabase = supabase.createUserClient(ctx.runtime);
    await next();
  });
}

export default async function runtimes({ services, supabase, ...params }) {
  const Runtimes = await getRuntimeModules(config.env.get("VIVA_RUNTIMES_DIR"));
  const runtimes = new Map();

  for (const { Ontology, Corpus, Games, Runtime } of Runtimes.values()) {
    const locals = { supabase: supabase.createAdminClient(), services };

    let runtime = {
      ...(await ensure(Runtime, locals)),
      symbol: Symbol(Runtime.manifest.type),
      bus: createEmitter(),
      router: createRouter(),
      schema: [Ontology, Corpus].reduce((a, { schema: s }) => s(a), {}),
      locals,
    };

    middlewares(runtime, runtimes, supabase);

    runtime = await Runtime.boot(runtime);
    runtime.ontology = await boot(Ontology, runtime);
    runtime.corpus = await boot(Corpus, runtime);
    runtime.games = await Promise.all(Games.values().map((G) => boot(G, runtime)));
    await connect(runtime, locals);

    // runtime.call = (i) => i,
    runtimes.set(runtime.symbol, runtime);
  }

  return { ...params, runtimes };
}
