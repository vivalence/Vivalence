import { View, Path, Url, is } from "@vivalence/typology";
import { Vector } from "@vivalence/vector";
import { svelte } from "./view-bundler.js";

export const traitmap = {
  VALENTIC: async (mode, daemon) => {
    console.log("VALENTIC", mode);
    const valences = mode.cake.dataset.entities["valence"];
    for (const valence of valences) {
      // valence.mode = mode.entity.id;
      await daemon.entities.valence.ensure(valence);
      console.log({ valence });
    }
    await daemon.entities.em.flush();
  },
  //DATASET: ()?

  TOPOLOGICAL: async (mode, runtime) => {
    console.log("skipping topological trait.");
    return;
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
    console.log("skipping viewable trait.");
    return;
    const bundle = mode.cake.mount.leaf("/bundle");
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
