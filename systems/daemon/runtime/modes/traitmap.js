import { View, Path, Url, is } from "@vivalence/typology";
import { svelte } from "./view-bundler.js";

export const traitmap = {
  VALENTIC: async (module, runtime) => {
    const valences = module.register.dataset.entities["valence"];
    for (const valence of valences) {
      valence.module = module.entity.id;
      await runtime.entities.valence.ensure(valence);
    }
    await runtime.entities.em.flush();
  },
  //DATASET: ()?
  TOPOLOGICAL: async (module, runtime) => {
    // await runtime.entities.topography.nativeDelete({});
    for (const dimension of module.register.topology?.dimensions || []) {
      await runtime.ontology.dimension.extend(dimension);
    }
    for (const topography of module.register.topology?.topographies || []) {
      // console.log(topography);
      await runtime.ontology.topography.ensure(topography);
    }
    // console.log(await runtime.ontology.topography.find());
    // console.log(await runtime.ontology.dimension.byBranch(["text", "*"]));

    await runtime.entities.em.flush();
  },

  GENERATOR: async (module, runtime) => {
    if (!!module.register.generate) {
      module.aperture.descendants.push(module.register.generate);
    }
    // todo: validate()
  },

  AGENTIC: (module, runtime) => {
    // module.aperture.use(inject(runtime.services.brain));
  },
  SESSIONED: async (module, runtime) => {},
  VIEWABLE: async (module, runtime) => {
    const bundle = module.path.leaf("/bundle").up().value;
    const url = new Url(runtime.attached.href + bundle);

    module.view = new View(module.register.view)
      .withUrl(url)
      .withBundler(svelte);

    module.view.bundle();

    module.aperture.open("/view", () => ({
      bundle: module.view.path.value,
      url: module.view.url,
    }));
  },
};
//SESSIONED: (module)=> {module.aperture.use() module.aperture.open('/')},
