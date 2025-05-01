import { enums } from "@vivalence/schema";

export default function register(daemon) {
  return async (runtime) => {
    let runtimeEntity = await daemon.entities.runtime.findOne({
      slug: runtime.config.manifest.slug,
    });

    if (!runtimeEntity) {
      runtimeEntity = daemon.entities.runtime.create({ slug: runtime.config.manifest.slug });
    }
    await runtimeEntity.modules.init();

    const modules = [
      runtime.config.modules.ontology,
      ...runtime.config.modules.corpora,
      ...runtime.config.modules.games,
      ...runtime.config.modules.tactics,
    ];

    for (const module of modules) {
      let moduleEntity = await daemon.entities.module.findOne({ slug: module.manifest.slug });
      if (!moduleEntity) {
        moduleEntity = daemon.entities.module.create({
          ...module.manifest,
          installation: enums.installation.PENDING,
        });
      } else if (module.manifest.version && moduleEntity.version !== module.manifest.version) {
        daemon.entities.em.assign(moduleEntity, {
          ...module.manifest,
          installation: enums.installation.PENDING,
        });
      }

      runtimeEntity.modules.add(moduleEntity);
    }

    runtime.entity = runtimeEntity;

    await daemon.entities.em.flush();
    return runtime;
  };
}
