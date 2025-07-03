import { is } from "@vivalence/shared";
import { enums } from "@vivalence/entities";

async function ensure(repo, data) {
  let entity = await repo.findOne({ slug: data.slug });

  if (!entity) {
    entity = repo.create({ ...data });
  } else if (data.version && data.version !== entity.version) {
    repo.em.assign(entity, { ...data });
  }
  return entity;
}

export default function (daemon) {
  return async (runtime) => {
    runtime.entity = await ensure(daemon.entities.runtime, runtime.manifest);

    await runtime.entity.modules.init();
    // await runtime.entity.services.init();
    // await runtime.entity.domain

    const modules = [];
    for (const [slug, some] of Object.entries(runtime.modules)) {
      if (is.array(some)) some.map((module) => modules.push(module));
      else modules.push(some);
    }
    for (const module of modules) {
      const entity = await ensure(daemon.entities.module, module.manifest);
      runtime.entity.modules.add(entity);
    }

    await daemon.entities.em.flush();
    return runtime;
  };
}
