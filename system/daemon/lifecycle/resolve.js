import { mw, Vector, parser } from "@vivalence/vector";
import { bundler, secure, is } from "@vivalence/shared";
import { maps } from "@vivalence/entities";

import * as lifecycle from "./runtime/index.js";

export async function runtimes(daemon) {
  for (const rme of daemon.runtimes) {
    await lifecycle.data(rme, daemon);
    await lifecycle.aperture(rme);

    if (rme.register.domain.lifecycle.boot)
      await rme.register.domain.lifecycle.boot(rme.instance);

    await lifecycle.schema(rme);
    await lifecycle.constraints(rme);
    await lifecycle.validation(rme);
    await lifecycle.asserter(rme);
    await lifecycle.taxonomist(rme);

    // await authority(rme);
    // await modules(rme);
    // await traits(rme);
  }
}

const traitmap = {
  // module exports view object or function.
  // if function, execute with instance for view object.
  VIEWABLE: (mme) => {
    // inject middlewares
    // daemon.attach.view(module.view)
    // if (!game.bundle?.path)
    //   throw new Error("[/learning/boot/games.js] Bundle Required", game);
    // const bundle = bundler(game.bundle.path);
    // bundle.url = bundle.absoluteUrl(game.aperture.path);
    // bundle.path = game.bundle.path;
    // game.bundle = bundle;
    // game.aperture.router.get(bundle.get, bundle.serve);
    // for (const modules of Object.values(rme.instance.modules)) {
    //   for (const module of Object.values(modules)) {
    //     if (module.manifest.traits?.includes("VIEWABLE")) {
    //       const base = config.env.get("VIVA_DAEMON_URL");
    //       const url = `${base}/attached/runtime/${runtime.manifest.slug}/views/${module.manifest.type}/${module.manifest.slug}/bundle/${module.view.bundle.entry}`;
    //       module.view.url = url;
    //     }
    //   }
    // }
  },
  // GENERATOR: (module)=> {const aperture = module.aperture .branch('/generate') .use(greedySession) .use(greedyView) module.generate(aperture)} AGENTIC: (module)=> {module.aperture.use(inject(services.brain))}, SESSIONED: (module)=> {module.aperture.use() module.aperture.open('/')}
};
async function traits(rme) {
  for (const mme of Object.values(rme.instance.domain.modulemap).flat()) {
    // build traitmap
    // apply traitmap
    // console.log(mme);
  }

  // if (instance.implements("LIFECYCLED") && module.construct) module.construct(instance);
  // traits: ["LIFECYCLED", "VIEWABLE", "SESSIONED", "GENERATOR", "VALENTIC"]
}

// if (runtime.config.modules.ontology.boot) runtime.config.modules.ontology.boot(ontology);

// later
// instance.aperture
//   .use(mw.identity(type, instance))
//   .branch(type)
//   .branch(slug)
// // some default handlers
// .open("/get", () => ({
//   manifest: game.manifest,
//   bundle: game.bundle,
// }))
// open("/status", () => ({ status: "game ok" }));
async function modules(rme, daemon) {
  for (const [type, map] of Object.entries(rme.register.domain.modules.map)) {
    const register = rme.register.modules[type];
    if (is.array(register))
      register.map((module) => {
        const slug = module.manifest.slug;
        const instance = new map.prototype().withManifest(module.manifest);

        // if (instance.implements("LIFECYCLED") && module.construct) module.construct(instance);
        // traits: ["LIFECYCLED", "VIEWABLE", "SESSIONED", "GENERATOR", "VALENTIC"]

        // module map entry
        const mme = { ...map, slug, type, instance, module };

        rme.instance.modules[type][slug] = instance;
        rme.register.domain.lifecycle.module(mme);
        rme.instance.domain.modulemap[type].push(mme);
      });
  }
}

async function moduleaperture(rme, daemon) {
  const runtime = rme.instance;

  runtime.aperture
    .branch("/modules")
    .open("/:module/:method", async (body, ctx) => {
      const params = ctx.params;

      const modules = ctx.runtime.modules[params.module];
      if (!modules) throw new Error("unsupported module");

      let module = {};
      switch (params.method) {
        case "findOne":
          module = modules[body.where.slug];
          break;
        default:
          throw new Error("unsupported method");
      }

      const result = {
        manifest: module.manifest,
      };

      if (module.manifest.traits.includes("VIEWABLE")) {
        result.view = { url: module.view.url };
      }

      return result;
    });
}

async function authority(rme) {
  const runtime = rme.instance;

  // const identity = [...daemon.services] //
  //   .find(({ slug, runtime }) => slug === "identity" && runtime === rme.slug);
  // if (!database.implements("IDENTITY")) throw new Error();

  // // runtime. = await identity.prototype.client(); // //

  const aperture = runtime.aperture.branch("/shard");

  aperture.open("/status", (body, ctx) => ({
    status: "identity:/status ok",
    timestamp: new Date().toISOString(),
  }));

  aperture
    .use(secure.authorize())
    .open("/handshake", async (_, ctx) => {
      const user = await ctx.identity.getUser();
      // console.log("user", user);
      return { success: true };
    })
    .open("/entities/:entity/:method", async (input, ctx) => {
      const params = ctx.params;
      if (!input.where) input.where = {};

      if (!["intent"].includes(params.entity))
        throw new Error("unsupported entity");
      if (!["find"].includes(params.method))
        throw new Error("unsupported method");

      const user = await ctx.identity.getUser();
      const repository = ctx.runtime.entities[params.entity];

      let result = {};
      switch (params.method) {
        case "find":
          input.where.user = user.id;
          result = await repository.find(input.where, input.options);
      }
      return result;
    });
}
