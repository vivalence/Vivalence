export async function runtimes(config) {
  const path = config.joins.config.runtimes("/");
  const vivaFiles = await config.find.files.viva(path);

  for (const file of vivaFiles) {
    const mod = await config.read.module(file);
    const runtimeconfig = await mod(config);
    if (!runtimeconfig) continue;

    // config.runtimes[runtime.manifest.slug] = runtime;
    config.runtimes.add(runtimeconfig);

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

        // const { data, secret, ...cleanConfig } = service;
        runtimeconfig.services[slug] = service;
      }
    }
  }

  return config;
}

export async function daemon(config) {
  const file = config.joins.config.system("daemon.viva.js");
  const mod = await config.read.module(file);
  const daemon = await mod(config);

  config.system.daemon = daemon;

  config.env.assign({
    VIVA_DAEMON_DOMAIN: daemon.server.domain,
    VIVA_DAEMON_PORT: daemon.server.port,
    VIVA_DAEMON_URL: `http://${daemon.server.domain}:${daemon.server.port}`,
  });
}

export async function clients(config) {
  const file = config.joins.config.system("clients.viva.js");
  const mod = await config.read.module(file);
  const clients = await mod(config);

  config.system.clients = clients;

  config.env.assign({
    VIVA_CLIENTS_WEB_DOMAIN: clients.web.domain,
    VIVA_CLIENTS_WEB_PORT: clients.web.port,
    VIVA_CLIENTS_WEB_URL: `http://${clients.web.domain}:${clients.web.port}`,
  });
}

// async function repository(config) {
//   const rootDir = config.env.get("VIVA_REPOSITORY_DIR");
//   const importmap = JSON.parse(
//     await Deno.readTextFile(rootDir + "/import_map.json"),
//   );
//   config.repo = { root: rootDir, importmap: importmap.imports };
//   return config;
// }
