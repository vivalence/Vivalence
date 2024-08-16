const start = performance.now();
import supabase from "../lib/supabase/index.js";
import getRuntimes from "../lib/viva/module-loader.js";
import config from "@vivalence/config";

import createServerServices from "@vivalence/services/server.js";

import validate from "../lib/validate.js";
import bundler from "../lib/bundler/index.js";
import createRouter from "../server/router/create.js";
import createEmitter from "./lib/createEmitter.js";
import middlewares from "./lib/middlewares.js";
import boot from "./lib/boot.js";
import ensure from "./lib/ensure.js";
import connect from "./lib/connect.js";

export default async function runtimes({ ...params }) {
  const Runtimes = await getRuntimes(config.env.get("VIVA_RUNTIMES_DIR"));
  const runtimes = new Map();

  for (const { Domain, Ontology, Corpus, Games, Runtime } of Runtimes.values()) {
    const services = createServerServices("");
    const locals = {
      validate: validate(),
      bundler: bundler(),
      supabase: supabase.createAdminClient(),
      services,
    };

    let runtime = {
      ...(await ensure(Runtime, { locals })),
      ["#symbol"]: Symbol(Runtime.manifest.type),
      bus: createEmitter(),
      router: createRouter(),
      schema: [Ontology, Corpus].reduce((a, { schema: s }) => s(a), {}),
      statics: { language: { known: "english", learning: "spanish" } },
      locals,
      services,
    };

    middlewares(runtime, runtimes);

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

  return { ...params, supabase, runtimes };
}
