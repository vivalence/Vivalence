import { is, cast, fromm, Path, v } from "@vivalence/typology";

export async function publish(paladin) {
  const publish = Object.entries(paladin.env.vars).filter(([key]) => key.startsWith("PUBLIC_"));

  for (const [key, value] of publish) {
    Deno.env.set(key, value);
  }
}

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
  delete paladin.tilde;

  // const secret = Object.entries(paladin.env.vars).filter(([key]) => key.startsWith("SECRET_VIVA_")); console.log(secret); for (const [key, value] of secret) {Deno.env.set(key, null);} console.log("env", Deno.env.toObject());
}

export async function validate(paladin) {
  // console.log({ ...paladin.variant });
  const errors = [];
  const collect = (label, value, schema) => {
    for (const e of schema.errors(value)) {
      errors.push(`${label}${e.instancePath || ""}: ${e.message}`);
    }
  };

  if (Object.keys(paladin.variant.runtime).length)
    collect("runtime", paladin.variant.runtime, v.primitives.variant.Runtime);
  for (const [slug, client] of Object.entries(paladin.variant.clients))
    collect(`client[${slug}]`, client, v.primitives.variant.Client);
  for (const daemon of paladin.variant.daemons)
    collect(`daemon[${daemon.slug}]`, daemon, v.primitives.circuitry.Daemon);
  for (const service of paladin.variant.services)
    collect(`service[${service.slug}]`, service, v.primitives.circuitry.Service);

  if (errors.length) throw new Error(`[paladin.validate]\n  ${errors.join("\n  ")}`);
  // console.log(JSON.stringify({ errors }, null, 2));
}

// export async function mount(paladin) {
// return await paladin.vip.mount(new Path(paladin.env.get("VIVA_VIP_MOUNT")));
// }

// export async function statements(paladin) {
//   const directories = [...Object.values(paladin.scope).map((p) => p.absolute)];

//   for (const dir of directories) {
//     await paladin.state.dir(dir);
//   }
// }

export async function questions(paladin) {
  return;
  if (paladin.is.citizen)
    paladin.check
      .path([
        paladin.env.get("VIVA_REPOSITORY_MOUNT"),
        paladin.env.get("VIVA_VARIANT_MOUNT"),
        paladin.env.get("VIVA_REGISTRY_MOUNT"),
      ])
      .throw();
}
