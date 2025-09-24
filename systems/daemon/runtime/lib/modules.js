import { is } from "@vivalence/shared";
import { Path, path } from "@vivalence/typology";
import { View } from "@vivalence/pack";

export const traitmap = {
  VALENTIC: async (module, runtime) => {
    const valences = module.register.dataset.entities["valence"];
    for (const valence of Object.values(valences)) {
      valence.module = { slug: module.slug, type: module.type };
      if (!(await runtime.entities.valence.findOne(valence)))
        runtime.entities.valence.create(valence);
    }
    await runtime.entities.em.flush();
  },

  GENERATOR: async (module, runtime) => {
    if (is.fn(module.register.generate)) {
      module.register.generate(module.aperture);
    } else if (!!module.register.generate) {
      module.aperture.descendants.push(module.aperture);
    }
    // aperture.use(greedySession).use(greedyView);
    // aperture.use(shards.module.view(module))
    // validate()
  },

  SESSIONED: async (module, runtime) => {},
  VIEWABLE: async (module, runtime) => {
    const bundle = module.path.leaf("/bundle").up().value;
    const url = new URL(runtime.attached.href + bundle);
    module.view = await new View(module.register.view, url);

    module.aperture.open("/view", () => ({
      bundle: module.view.path.value,
      url: module.view.url,
    }));
  },

  //AGENTIC: (module)=> {module.aperture.use(inject(services.brain))}, //SESSIONED: (module)=> {module.aperture.use() module.aperture.open('/')},
};
