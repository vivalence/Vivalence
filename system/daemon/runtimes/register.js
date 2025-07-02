import { is } from "@vivalence/shared";
import { enums } from "@vivalence/entities";

async function register() {
  let entity = await daemon.entities.module //
    .findOne({ slug: module.manifest.slug });

  if (!entity) {
    entity = daemon.entities.module.create({
      ...module.manifest,
    });
  } else if (
    module.manifest.version &&
    moduleEntity.version !== module.manifest.version
  ) {
    daemon.entities.em.assign(moduleEntity, {
      ...module.manifest,
    });
  }
}
export default function (daemon) {
  return async (runtime) => {
    let entity = await daemon.entities.runtime.findOne({
      slug: runtime.manifest.slug,
    });

    if (!entity) {
      entity = daemon.entities.runtime.create({
        slug: runtime.manifest.slug,
      });
      await daemon.entities.em.flush();
    }

    await entity.modules.init();

    const modules = [];
    for (const [slug, some] of Object.entries(runtime.modules)) {
      if (is.array(some)) some.map((module) => modules.push(module));
      else modules.push(some);
    }

    for (const module of modules) {
      //   runtimeEntity.modules.add(moduleEntity);
    }

    runtime.entity = runtimeEntity;

    await daemon.entities.em.flush();
    return runtime;
  };
}
