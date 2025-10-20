import { Path, cast, as, is } from "@vivalence/typology";

export async function variant(paladin) {
  // console.log(0);
  const file = paladin.join.tilde("variant/variant.viva.js");
  // console.log(0, file);

  const module = await paladin.read.module(file);
  const { statics, manifest, gaia, daemon, clients, services } = module;

  // TODO derive serve & remote!
  // TODO cast/is

  if (manifest) {
    paladin.variant = manifest.slug;
    paladin.traits = manifest.traits || [];
  }

  if (statics) paladin.statics = statics;
  if (gaia) paladin.gaia = gaia;
  if (daemon) paladin.daemon = daemon;

  if (clients) {
    clients.map((client) => {
      paladin.clients.push(client);
    });
  }

  if (services) {
    services.map((service) => {
      service.mount = paladin.join.mountpoint.service(service.slug);
      paladin.services.push(service);
    });
  }
}

export async function service(paladin) {
  paladin.service = {};
  paladin.services.map((service) => (paladin.service[service.slug] = service));
}

export async function runtimes(paladin) {
  const modules = (
    await Promise.all(
      (await paladin.find.viva(paladin.join.variant.runtimes())) //
        .map(async (file) => [file, await paladin.read.viva(file)]),
    )
  ).filter(([, module]) => is.module(module));

  for (const [file, module] of modules) {
    const runtime = cast.runtime(module);
    runtime.mount = paladin.join.mountpoint.runtime(runtime.slug);

    if (runtime.services) {
      runtime.services = runtime.services
        .map((service) => (is.string(service) ? { module: service } : service))
        .map((service) => ({
          ...service,
          mount: paladin.join.mountpoint.service(service.slug, runtime.slug),
          runtime: runtime.slug,
        }))
        .map((service) => {
          // TODO
          // if service.module then fa()
          // if service.remote then fb()
          // if (is.string(service.service)) return paladin.service[service];
          return service;
        })
        .map((service) => {
          paladin.services.push(service);
          return service;
        });
    }

    paladin.runtimes.push(runtime);
  }
}
