const start = performance.now();
import config from "@vivalence/config";

import createServerServices from "@vivalence/services/server.js";

import getRuntimes from "../lib/viva/module-loader.js";
import supabase from "../lib/supabase/index.js";
import createValidator from "../lib/validator/create.js";
import createRouter from "../server/router/create.js";
import createEmitter from "../lib/emitter/create.js";

import middlewares from "./middlewares/index.js";

import boot from "./lib/boot.js";
import ensure from "./lib/ensure.js";
import connect from "./lib/connect.js";

import runtimes from "./index.js";

export default async function buildRuntimes({ ...params }) {
  const Runtimes = await getRuntimes(config.env.get("VIVA_RUNTIMES_DIR"));

  for (const {
    Runtime,
    Domain,
    Ontology,
    Corpus,
    Games,
    Tactics,
    Strategies,
  } of Runtimes.values()) {
    const services = createServerServices("");
    const locals = {
      validate: createValidator(),
      supabase: supabase.createAdminClient(),
      services,
    };

    let runtime = {
      ["#symbol"]: Symbol(`${Runtime.manifest.slug}-${Runtime.manifest.version}`),
      manifest: await ensure(Runtime, { locals }),
      Module: Runtime,
      bus: createEmitter(),
      router: createRouter(),
      schema: [Ontology, Corpus].reduce((a, { schema: s }) => s(a), {}),
      statics: { language: { known: "english", learning: "spanish" } },
      locals,
      services,
    };

    middlewares.runtime(runtime);

    runtime = (await Runtime.boot(runtime, { ...Runtime, manifest: runtime.manifest })) || runtime;
    runtime.domain = await boot(Domain, runtime);
    runtime.ontology = await boot(Ontology, runtime);
    runtime.corpus = await boot(Corpus, runtime);
    runtime.games = await boot.many(Games, runtime);
    runtime.tactics = await boot.many(Tactics, runtime);
    runtime.strategies = await boot.many(Strategies, runtime);

    runtime.caller = runtime.router.caller(runtime);
    await connect(runtime);

    runtimes.set(runtime["#symbol"], runtime);
  }

  return { ...params, supabase, runtimes };
}
