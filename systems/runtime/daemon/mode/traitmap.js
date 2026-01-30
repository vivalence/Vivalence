import { Aperture } from "@vivalence/vector/aperture";
import { View, Path, Url, is } from "@vivalence/typology";
import { svelte } from "./view-bundler.js";

export * from "./traits/productive.js";

export const VIEWABLE = async (mode, daemon) => {
  mode.cake.view.withBundler(svelte);
  await mode.cake.view.bundle();
  mode.aperture.open("/view", () => ({ url: mode.cake.view.url.absolute }));
};

export const VALENTIC = async (mode, daemon) => {
  const valences = mode.cake.dataset.entities["valence"];
  for (const valence of valences) {
    valence.mode = mode.entity.id;
    await daemon.entities.valence.ensure(valence);
  }
  await daemon.entities.em.flush();
};

export const CHAOSMONKEY = (mode, daemon) => {
  mode.aperture.use(async (ctx, next) => {
    ctx.hallucinate = daemon.brain;
    await next();
  });
  // mode.aperture.use(inject(runtime.services.brain));
};

// const DATASET = async (mode, daemon) => {
//   // console.log({ mode });
//   // for (const [type, dataset] of Object.entries(mode.dataset?.entities)) {console.log({ type, dataset });}
//   // await daemon.entities.em.flush();
// };

// TOPOLOGICAL: async (mode, daemon) => {
//   console.log("skipping topological trait.");
//   return;
//   // await runtime.entities.subject.nativeDelete({});
//   for (const dimension of mode.cake.topology?.dimensions || []) {
//     await daemon.ontology.dimension.extend(dimension);
//   }
//   for (const subject of mode.cake.topology?.topographies || []) {
//     // console.log(subject);
//     await daemon.ontology.subject.ensure(subject);
//   }
//   // console.log(await runtime.ontology.subject.find());
//   // console.log(await runtime.ontology.dimension.byBranch(["text", "*"]));

//   await daemon.entities.em.flush();
// },

// SESSIONED: async (mode, daemon) => {},
//SESSIONED: (mode)=> {mode.aperture.use() mode.aperture.open('/')},

// let module = await import(resolve(path)); return module;
//   // check.module(module)?.throw()
//   // if (!module.manifest && module.default?.manifest) module = module.default;

//   // if (module.manifest?.traits?.includes("VIEWABLE")) {
//   //   if (module.view instanceof Path)
//   //     module.view = new Path(dirname(path.absolute)).branch(module.view.value,);
//   //   else if (is.string(module.view))
//   //     module.view = new Path(dirname(path.absolute)).branch(module.view);
//   //   else
//   //     console.warn("@registry: imported viewable module missing .view.entry",);
//   //   console.log("MODULE VIEQ");
//   //   console.log(module.view.absolute);
//   //   console.log(module.view.down().value);
//   // }
