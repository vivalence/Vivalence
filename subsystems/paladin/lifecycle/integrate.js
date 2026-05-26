import { is, fromm } from "@vivalence/typology";

export async function statements(paladin) {
  const mounts = [];

  if (paladin.is.citizen) {
    mounts.push([
      paladin.scope.mountpoint,
      paladin.scope.repository,
      paladin.scope.registry,
      paladin.scope.variant,
      // paladin.scope.circuitry, // backup: pre-M1 variant quest
      paladin.scope.environment,
      ...paladin.variant.services.map((s) => s.mount),
      ...paladin.variant.daemons.map((d) => d.mount),
      ...paladin.variant.daemons
        .filter((d) => is.object(d.consume))
        .map((d) => fromm.slugmap(d.consume).array)
        .flat()
        .filter(Boolean)
        .map((c) => c.mount),
    ]);
  }

  for (const mount of mounts.flat().filter(Boolean)) {
    // console.log("@testable mount:", mount.absolute);
    await paladin.state.dir(mount.absolute);
  }
}

export async function secure(paladin) {
  delete paladin.secret;
  delete paladin.tilde; // depracated.

  // const secret = Object.entries(paladin.env.vars).filter(([key]) => key.startsWith("SECRET_VIVA_")); console.log(secret); for (const [key, value] of secret) {Deno.env.set(key, null);} console.log("env", Deno.env.toObject());
}

// export async function questions(paladin) {
//   return;
//   // if (paladin.is.citizen)
//   //   paladin.check
//   //     .path([
//   //       paladin.env.get("VIVA_REPOSITORY_MOUNT"),
//   //       paladin.env.get("VIVA_VARIANT_MOUNT"),
//   //       paladin.env.get("VIVA_REGISTRY_MOUNT"),
//   //     ])
//   //     .throw();
// }

// validate migrated to prototypes/variant.js (part of variant.mount).

// export async function mount(paladin) {
// return await paladin.vip.mount(new Path(paladin.env.get("VIVA_VIP_MOUNT")));
// }

// export async function statements(paladin) {
//   const directories = [...Object.values(paladin.scope).map((p) => p.absolute)];

//   for (const dir of directories) {
//     await paladin.state.dir(dir);
//   }
// }
