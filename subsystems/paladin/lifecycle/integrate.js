import { is, cast, Path } from "@vivalence/typology";

export async function publish(paladin) {
  const publish = Object.entries(paladin.env.vars).filter(([key]) =>
    key.startsWith("PUBLIC_"),
  );

  for (const [key, value] of publish) {
    Deno.env.set(key, value);
  }
}

export async function secure(paladin) {
  delete paladin.secret;
  delete paladin.tilde;
}

export async function validate(paladin) {
  // const requiredEnvVars = [
  //   //
  // ];
  // paladin.check.env(requiredEnvVars)?.throw();
  // for (const service of paladin.services) {
  //   if (service.data) await paladin.state.path(service.data);
  // }
}

// export async function mount(paladin) {
// return await paladin.vip.mount(new Path(paladin.env.get("VIVA_VIP_MOUNT")));
// }
