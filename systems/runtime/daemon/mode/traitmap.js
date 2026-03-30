import { shape } from "@vivalence/typology";

export * from "./traits/dataset.js";
export * from "./traits/intented.js";
export * from "./traits/emitter.js";
export * from "./traits/buffered.js";

export const SELFEVIDENT = () => {};

export const EXPOSED = (mode) => {
  if (!mode.aperture) {
    console.warn(`[EXPOSED] ${mode.type}/${mode.slug} has no aperture`);
    return;
  }
  return () => {
    mode.call = shape.object(mode.aperture);
  };
};

// export const VIEWABLE = (mode, daemon) => {
//   mode.cake.view.withBundler(svelte);
//   mode.aperture.open("/view", () => ({ url: mode.cake.view.url.absolute }));
// };

export const FRAUGHT = async (mode, daemon) => {
  await mode.cake.freight.index();
  mode.aperture.open("/freight", () => mode.cake.freight.catalog);
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
