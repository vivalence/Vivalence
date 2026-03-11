import { View } from "@vivalence/typology";
import { svelte } from "./view-bundler.js";

export * from "./traits/producer.js";
export * from "./traits/dataset.js";
export * from "./traits/valentic.js";

export const TERMINAL = async (mode, daemon) => {
  // console.log("TERMINAL", mode);
  mode.cake.view.withBundler(svelte);
  await mode.cake.view.bundle();
  mode.aperture.open("/view", () => ({ url: mode.cake.view.url.absolute }));
};

export const CHAOSMONKEY = (mode, daemon) => {
  mode.brain = daemon.hallucinator; // ??naming unsettled...
  mode.aperture.use(async (ctx, next) => {
    // ctx.hallucinate = daemon.brain;
    await next();
  });
  // mode.aperture.use(inject(runtime.services.brain));
};

// export const TOPOGRAPHICAL = async (mode, daemon) => {
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
// }

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
