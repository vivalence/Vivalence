import { is } from "@vivalence/shared";
import { Path, path } from "@vivalence/typology";
import { View } from "@vivalence/pack";

export const traitmap = {
  VALENTIC: async (module, runtime) => {
    const valences = module.register.dataset.entities["valence"];
    for (const valence of valences) {
      let entity = await runtime.entities.valence.findOne({
        slug: valence.slug,
        module: module.entity.id,
      });
      if (!entity) {
        runtime.entities.valence.create({
          ...valence,
          module: module.entity.id,
        });
      }
    }
    await runtime.entities.em.flush();
  },
  //DATASET: ()?

  GENERATOR: async (module, runtime) => {
    if (is.fn(module.register.generate)) {
      module.register.generate(module.aperture);
    } else if (!!module.register.generate) {
      module.aperture.descendants.push(module.aperture);
    }
    // todo: validate()
  },

  AGENTIC: (module, runtime) => {
    // module.aperture.use(inject(runtime.services.brain));
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
};
//SESSIONED: (module)=> {module.aperture.use() module.aperture.open('/')},
