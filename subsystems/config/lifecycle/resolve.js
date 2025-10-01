export async function runtimes(config) {
  const path = config.joins.config.runtimes("/");
  const vivaFiles = await config.find.files.viva(path);

  for (const file of vivaFiles) {
    const mod = await config.read.module(file);
    const runtimeconfig = await mod(config);
    if (!runtimeconfig) continue;

    if (!runtimeconfig.lighthouse.data)
      runtimeconfig.lighthouse.data = config.joins.data.runtime(
        `${runtimeconfig.manifest.slug}_lighthouse`,
      );
    if (!runtimeconfig.database.data)
      runtimeconfig.database.data = config.joins.data.runtime(
        `${runtimeconfig.manifest.slug}_database`,
      );

    if (runtimeconfig.services) {
      for (const [slug, serviceconfig] of Object.entries(
        runtimeconfig.services,
      )) {
        const service = {
          ...serviceconfig,
          slug,
          runtime: runtimeconfig.manifest.slug,
          data: config.joins.data.runtime(runtimeconfig.manifest.slug, slug),
        };

        config.services.add(service);
        runtimeconfig.services[slug] = service;
      }
    }

    config.runtimes.add(runtimeconfig);
  }

  return config;
}

// async function repository(config) {
//   const rootDir = config.env.get("VIVA_REPOSITORY_DIR");
//   const importmap = JSON.parse(
//     await Deno.readTextFile(rootDir + "/import_map.json"),
//   );
//   config.repo = { root: rootDir, importmap: importmap.imports };
//   return config;
// }
