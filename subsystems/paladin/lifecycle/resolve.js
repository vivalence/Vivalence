import { v } from "@vivalence/typology";
import { dirname } from "@std/path";
import { Url, Mask, Path, cast, fromm, is } from "@vivalence/typology";

// backup: pre-M1 variant quest — circuit-typed files in <variant>/circuitry/ folded into paladin.variant.*
// export async function circuitry(paladin) {
//   if (!paladin.scope.circuitry) return;
//   await paladin.state.dir(paladin.scope.circuitry.absolute);
//   const modules = await paladin.find.viva(paladin.scope.circuitry);
//   const fn = async (f) => [f, await paladin.read.viva(f)];
//   const circuitry = (await Promise.all(modules.map((f) => fn(f))))
//     .filter(([, module]) => module?.manifest?.type === "circuit")
//     .map(([source, circuit]) => ({ ...circuit, source }));
//   paladin.variant.circuitry = circuitry;
// }

// @beef this function needs to become a tool in belt.
// lifecycle decides to invoke it depending on some criteria - like env var presence.
// same for system and repository - and by extension: registry.
export async function variant(paladin) {
  // console.log(paladin, JSON.stringify({ ...paladin.is }, null, 2));
  if (!paladin.scope.variant) return;
  const variantAbs = paladin.scope.variant.absolute;
  await paladin.state.dir(variantAbs);

  const paths = await paladin.find.viva(paladin.scope.variant);
  // console.log({ paths });

  const cakes = await Promise.all(
    paths.map(async (p) => ({ ...(await paladin.read.viva(p)), source: p })),
  );
  // console.log({ cakes });
  // console.log(JSON.stringify({ cakes }, null, 2));
  // console.log(v);
  const markers = cakes.filter((c) => c.manifest?.type === "variant");

  if (markers.length === 0) {
    throw new Error(`No variant manifest at root of ${variantAbs}`);
  }
  if (markers.length > 1) {
    throw new Error(
      `Multiple variant manifests at root of ${variantAbs}: ${markers
        .map((m) => m.source.absolute)
        .join(", ")}`,
    );
  }

  const marker = markers[0];

  paladin.variant.runtime = marker.runtime || {};
  paladin.variant.clients = marker.clients || {};

  paladin.variant.daemons = [...(marker.daemons || []), ...(marker.circuitry?.daemons || [])].map(
    (daemon) => {
      const mask = new Mask(daemon);
      mask.mount = paladin.scope.mountpoint.branch(`/daemon_${mask.slug}`);
      if (mask.datamap && !mask.datamap.mount) mask.datamap.mount = mask.mount;
      return mask;
    },
  );

  paladin.variant.services = [
    ...(marker.services || []),
    ...(marker.circuitry?.services || []),
  ].map((service) => {
    const mask = new Mask(service);
    mask.mount = paladin.scope.mountpoint.branch(`/service_${mask.slug}`);
    if (mask.datamap && !mask.datamap.mount) mask.datamap.mount = mask.mount;
    return mask;
  });
  // console.log(JSON.stringify({ ...paladin.variant }, null, 2));
  // console.log("paladin.variant.daemons");
  // console.log(paladin.variant.services);
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
