import { View, Path, Url, is } from "@vivalence/typology";
import { Vector } from "@vivalence/vector";
import { svelte } from "./view-bundler.js";

export const traitmap = {
  VALENTIC: async (mode, daemon) => {
    // console.log("VALENTIC", mode);
    const valences = mode.cake.dataset.entities["valence"];
    for (const valence of valences) {
      valence.mode = mode.entity.id;
      await daemon.entities.valence.ensure(valence);
    }
    await daemon.entities.em.flush();
  },
  //DATASET: ()?

  TOPOLOGICAL: async (mode, daemon) => {
    console.log("skipping topological trait.");
    return;
    // await runtime.entities.subject.nativeDelete({});
    for (const dimension of mode.cake.topology?.dimensions || []) {
      await daemon.ontology.dimension.extend(dimension);
    }
    for (const subject of mode.cake.topology?.topographies || []) {
      // console.log(subject);
      await daemon.ontology.subject.ensure(subject);
    }
    // console.log(await runtime.ontology.subject.find());
    // console.log(await runtime.ontology.dimension.byBranch(["text", "*"]));

    await daemon.entities.em.flush();
  },

  CASTING: async (mode, daemon) => {
    if (!!mode.cake.caster) {
      mode.aperture.descendants.push(mode.cake.caster);
    }
    // todo: validate()
  },

  SESSIONED: async (mode, daemon) => {},

  CHAOSMONKEY: (mode, daemon) => {
    // mode.aperture.use(inject(runtime.services.brain));
  },
  VIEWABLE: async (mode, daemon) => {
    mode.cake.view.withBundler(svelte);
    await mode.cake.view.bundle();
    mode.aperture.open("/view", () => ({ url: mode.cake.view.url.absolute }));
  },
};
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
