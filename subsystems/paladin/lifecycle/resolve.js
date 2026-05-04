import { Url, Mask, Path, cast, fromm, is } from "@vivalence/typology";

// load circuitry from tilde into variant.circuitry
// paladin.find.viva(paladin.scope.variant)
// filter for manifest.type circuit

export async function circuitry(paladin) {
  // console.log(paladin.env);
  // console.log(paladin.scope.circuitry);
  if (!paladin.scope.circuitry) return;
  await paladin.state.dir(paladin.scope.circuitry.absolute);
  // console.log("stated:", paladin.scope.circuitry.absolute);
  // unnessesarily complex
  const modules = await paladin.find.viva(paladin.scope.circuitry);
  // console.log("found modules:", { modules });
  const fn = async (f) => [f, await paladin.read.viva(f)];
  const circuitry = (await Promise.all(modules.map((f) => fn(f))))
    .filter(([, module]) => module?.manifest?.type === "circuit")
    .map(([source, circuit]) => ({ ...circuit, source }));
  // paladin.variant.circuitry(circuit =>(circuit))
  // console.log("found circuitry:", { circuitry });
  paladin.variant.circuitry = circuitry;
}

export async function variant(paladin) {
  const circuitry = paladin.variant.circuitry;
  // not good for figuring out what part of the config belongs together! @change: process sequentually.
  const runtimeConfigs = circuitry.map((c) => c.runtime).filter(Boolean);
  const clientsConfigs = circuitry.map((c) => c.clients).filter(Boolean);
  const daemonsConfigs = circuitry.flatMap((c) => c.daemons || []);
  const servicesConfigs = circuitry.flatMap((c) => c.services || []);

  // console.log("clients:", { clientsConfigs });

  if (runtimeConfigs.length > 1) {
    // same for lighthouse
    throw new Error("Multiple runtime configurations found in circuitry");
  }

  paladin.variant.runtime = runtimeConfigs[0] || {};
  // paladin.variant.lighthouse = lighthouseConfigs[0] || {};
  // paladin.variant.runtime.mount =  ??

  paladin.variant.clients = Object.assign({}, ...clientsConfigs);

  // console.log("clients:", { ...paladin.variant.clients });
  // if role = client & !clients[*]; then check if env client; then resolve
  // if (paladin.is.client) {if (is.empty(paladin.variant.clients) && paladin.env.has("VIVA_CLIENT_KAJUIT_SERVE")) {paladin.variant.clients.kajuit = {statics: {serve: new Url(paladin.env.get("VIVA_CLIENT_KAJUIT_SERVE")),},};} if (paladin.env.has("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")) {paladin.variant.clients.kajuit.statics.lighthouse = {remote: new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),};} if (paladin.env.has("PUBLIC_VIVA_CLIENT_KAJUIT_REMOTE")) {paladin.variant.clients.kajuit.statics.remote = new Url(paladin.env.get("PUBLIC_VIVA_CLIENT_KAJUIT_REMOTE"),);}}

  paladin.variant.daemons = daemonsConfigs.map((daemon) => {
    const mask = new Mask(daemon);

    mask.mount = paladin.scope.mountpoint.branch(`/daemon_${mask.slug}`);

    if (mask.datamap && !mask.datamap.mount) mask.datamap.mount = mask.mount;
    return mask;
  });

  paladin.variant.services = servicesConfigs.map((service) => {
    const mask = new Mask(service);

    mask.mount = paladin.scope.mountpoint.branch(`/service_${mask.slug}`);

    if (mask.datamap && !mask.datamap.mount) mask.datamap.mount = mask.mount;
    return mask;
  });
}

// export async function consumables(paladin) {for (const daemon of paladin.variant.daemons) {if (!daemon.consume) continue; for (const service of fromm.slugmap(daemon.consume).array) {let f; if (is.string(service.provider)) f = (s) => s.slug === service.provider; const provider = paladin.variant.services.find(f); if (provider) {service.provide = provider; service.mount = service.provider.mount; daemon.consume[service.slug] = service; continue;} console.warn("[@paladin] resolution issue: service provider not found"); console.log({ service });}}}

// export async function cross(paladin) {
//   console.log({ paladin: { ...paladin.variant } });

//   const requiredServices = [];
//   for (const daemon of paladin.variant.daemons) {
//     if (daemon.consume) {
//       requiredServices.push(...Object.keys(daemon.consume));
//     }
//   }

//   const availableServices = paladin.variant.services.map((s) => s.slug);
//   const missingServices = requiredServices.filter(
//     (s) => !availableServices.includes(s),
//   );

//   console.log();

//   if (missingServices.length > 0) {
//     throw new Error(`Missing required services: ${missingServices.join(", ")}`);
//   }

//   if (paladin.variant.runtime && !paladin.variant.runtime.statics?.serve) {
//     console.warn("Runtime configuration missing serve URL");
//   }
// }

// runtime, clients, daemons, services,
// there is a lot to be done here now.
//
