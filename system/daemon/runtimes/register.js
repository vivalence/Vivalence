import { is } from "@vivalence/shared";
import registry from "@vivalence/registry";
import { enums } from "@vivalence/entities";

export default async function (daemon, runtime) {
  await runtime.entity.modules.init();

  const register = await Promise.all([
    registry.load(runtime.config.domain),
    registry.loadMap(runtime.config.modules),
    // registry.loadMap(runtime.config.services), // doesnt work w/o some normalization
  ]);

  runtime.register = {
    domain: register[0],
    modules: register[1],
    // services: register[2],
  };

  for (const [slug, some] of Object.entries(runtime.register.modules)) {
    if (is.array(some)) {
      for (const module of some) {
        runtime.entity.modules.add(
          await ensure(daemon.entities.module, module.manifest),
        );
      }
    } else
      runtime.entity.modules.add(
        await ensure(daemon.entities.module, some.manifest),
      );
  }
}

export async function ensure(repo, data) {
  let entity = await repo.findOne({ slug: data.slug });

  if (!entity) {
    entity = repo.create({ ...data });
  } else if (data.version && data.version !== entity.version) {
    repo.em.assign(entity, { ...data });
  }
  return entity;
}
