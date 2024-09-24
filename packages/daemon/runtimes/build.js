import config from "@vivalence/config";

import createServerServices from "@vivalence/services/server.js";

import getRuntimes from "../lib/viva/module-loader.js";

import supabase from "../lib/supabase/index.js";
import createValidator from "../lib/validator/create.js";
import createRouter from "../server/router/create.js";
import createEmitter from "../lib/emitter/create.js";

import register from "./lib/register.js";
import boot from "./lib/boot.js";
import connect from "./lib/connect.js";

import runtimes from "./index.js";

function runtimeMiddleware(runtime) {
  function middlewareRuntime(ctx) {
    delete ctx.locals;
    ctx.runtime = runtimes.get(runtime["#symbol"]);

    if (!ctx.runtime.locals.supabase) {
      ctx.runtime.locals.supabase = supabase.createUserClient(ctx);
    }

    ctx.runtime.locals.getUser = async () => {
      const { data, error } = await ctx.runtime.locals.supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    };

    ctx.runtime.call = runtime.caller(ctx);
    return ctx.runtime;
  }

  runtime.bus.use((ctx, next) => {
    ctx.runtime = middlewareRuntime(ctx);
    ctx.runtime.locals.supabase = supabase.createAdminClient();
    next();
  });

  runtime.router.middleware.push(async (ctx, next) => {
    ctx.runtime = middlewareRuntime(ctx);
    await next();
  });
  return runtime;
}

async function buildRuntime(Runtime) {
  const services = createServerServices("");

  const locals = {
    validate: createValidator(),
    supabase: supabase.createAdminClient(),
    services,
  };

  const schema = [Runtime.modules.ontology, ...Runtime.modules.corpora].reduce(
    (a, { schema: s }) => (s ? s(a) : a),
    {},
  );

  const { manifest } = await register(Runtime, { locals });
  let runtime = {
    ["#symbol"]: Symbol(`${Runtime.manifest.slug}-${Runtime.manifest.version}`),
    manifest,
    Module: Runtime,
    bus: createEmitter(),
    router: createRouter(),
    schema,
    statics: { language: { known: "english", learning: "spanish" } },
    locals,
    services,
  };
  return runtime;
}

async function build(Runtime) {
  let runtime = await buildRuntime(Runtime);

  Runtime.modules.domain = await register(Runtime.modules.domain, runtime);
  Runtime.modules.ontology = await register(Runtime.modules.ontology, runtime);
  Runtime.modules.corpora = await register.many(Runtime.modules.corpora, runtime);
  Runtime.modules.games = await register.many(Runtime.modules.games, runtime);
  Runtime.modules.tactics = await register.many(Runtime.modules.tactics, runtime);
  Runtime.modules.strategies = await register.many(Runtime.modules.strategies, runtime);

  runtime = runtimeMiddleware({ ...runtime, ...Runtime.modules });

  runtime = (await Runtime.boot(runtime, { ...Runtime, manifest: runtime.manifest })) || runtime;
  runtime.domain = await boot(Runtime.modules.domain, runtime);
  runtime.ontology = await boot(Runtime.modules.ontology, runtime);
  runtime.corpora = await boot.many(Runtime.modules.corpora, runtime);
  runtime.games = await boot.many(Runtime.modules.games, runtime);
  runtime.tactics = await boot.many(Runtime.modules.tactics, runtime);
  runtime.strategies = await boot.many(Runtime.modules.strategies, runtime);

  runtime.caller = runtime.router.caller(runtime);
  await connect(runtime);

  return runtime;
}

export default async function ({ ...params }) {
  const Runtimes = await getRuntimes(config.env.get("VIVA_RUNTIMES_DIR"));

  for (const Runtime of Runtimes.values()) {
    try {
      if (!Runtime.boot) Runtime.boot = (r) => r;
      const runtime = await build(Runtime);
      runtimes.set(runtime["#symbol"], runtime);
    } catch (e) {
      console.error("[runtime build error]", e);
    }
  }

  return { ...params, supabase, runtimes };
}
