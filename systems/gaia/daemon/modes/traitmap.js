import { View, Path, Url, is } from "@vivalence/typology";
import { Vector } from "@vivalence/vector";
import { svelte } from "./view-bundler.js";

export const traitmap = {
  VALENTIC: async (mode, runtime) => {
    const valences = mode.cake.datamap.entities["valence"];
    for (const valence of valences) {
      valence.mode = mode.entity.id;
      await runtime.entities.valence.ensure(valence);
    }
    await runtime.entities.em.flush();
  },
  //DATASET: ()?

  TOPOLOGICAL: async (mode, runtime) => {
    // await runtime.entities.subject.nativeDelete({});
    for (const dimension of mode.cake.topology?.dimensions || []) {
      await runtime.ontology.dimension.extend(dimension);
    }
    for (const subject of mode.cake.topology?.topographies || []) {
      // console.log(subject);
      await runtime.ontology.subject.ensure(subject);
    }
    // console.log(await runtime.ontology.subject.find());
    // console.log(await runtime.ontology.dimension.byBranch(["text", "*"]));

    await runtime.entities.em.flush();
  },

  GENERATOR: async (mode, runtime) => {
    if (!!mode.cake.generate) {
      mode.aperture.descendants.push(mode.cake.generate);
    }
    // todo: validate()
  },

  AGENTIC: (mode, runtime) => {
    // mode.aperture.use(inject(runtime.services.brain));
  },
  SESSIONED: async (mode, runtime) => {},
  VIEWABLE: async (mode, runtime) => {
    const bundle = mode.path.leaf("/bundle").up().value;
    const url = new Url(runtime.attached.href + bundle);

    mode.view = new View(mode.cake.view).withUrl(url).withBundler(svelte);

    mode.view.bundle();

    mode.aperture.open("/view", () => ({
      bundle: mode.view.path.value,
      url: mode.view.url,
    }));
  },
};
//SESSIONED: (mode)=> {mode.aperture.use() mode.aperture.open('/')},
