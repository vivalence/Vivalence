// config.variant = VIVA_SYSTEM_VARIANT;

export async function variant(config) {
  const file = config.join.tilde("variant/variant.viva.js");
  console.log("file", file);

  config.tilde = { mount: new Path(VIVA_TILDE_MOUNT) };
  const mod = await config.read.viva(file);

  console.log("mod", mod);
  // const { gaia, daemon, clients, services } = await mod(config);

  // if (gaia) {
  //   config.gaia = gaia.config;
  //   if (typeof config.gaia.url !== SERVE)
  //     config.gaia.url = new SERVE(config.gaia.url);
  // }

  //   if (daemon) {
  // todo: typeof serve === url
  // const { serve } = daemon.config;
  // config.env.assign({
  //   VIVA_DAEMON_DOMAIN: serve.domain,
  //   VIVA_DAEMON_PORT: serve.port,
  //   VIVA_DAEMON_SERVE: `http://${serve.domain}:${serve.port}`,
  // });

  // config.daemon = daemon.config;
  // config.daemon.url = new SERVE(`http://${serve.domain}:${serve.port}`); //
  //   }

  //   if (clients) {
  // for (const [slug, client] of Object.entries(clients)) {
  //   const { serve } = client.config;

  //   const envKey = `VIVA_CLIENTS_${slug.toUpperCase()}`;
  //   const domainKey = `${envKey}_DOMAIN`;
  //   const portKey = `${envKey}_PORT`;
  //   const urlKey = `${envKey}_SERVE`;
  //   const url = `http://${serve.domain}:${serve.port}`;

  //   config.env.assign({
  //     [domainKey]: serve.domain,
  //     [portKey]: serve.port,
  //     [urlKey]: url,
  //   });

  //   config.clients[slug] = client.config;
  // } //
  //   }

  //   if (services) {
  //     //   for (const [slug, serviceconfig] of services) {
  //     //     const service = {
  //     //       ...serviceconfig,
  //     //       slug,
  //     //       data: config.joins.data.service(slug),
  //     //     };
  //     //     config.services.add(service);
  //     //   }
  //   }

  return config;
}

export async function runtimes(config) {
  const path = config.joins.config.runtimes("/");
  const vivaFiles = await config.find.files.viva(path);

  for (const file of vivaFiles) {
    const mod = await config.read.module(file);
    const runtimeconfig = await mod(config);
    if (!runtimeconfig) continue;

    // if (!runtimeconfig.datamap.data) runtimeconfig.datamap.data = config.joins.data.runtime(`${runtimeconfig.manifest.slug}_datamap`,);
    // if (!runtimeconfig.gaia.data) runtimeconfig.gaia.data = config.joins.data.runtime(`${runtimeconfig.manifest.slug}_gaia`,);

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
