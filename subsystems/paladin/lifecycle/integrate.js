import { is, object, v } from "@vivalence/typology";

export async function statements(paladin) {
  const { Instance, Mountpoint } = v.primitives.instance;
  const mounts = [];

  if (paladin.is.citizen) {
    mounts.push([
      paladin.scope.mountpoint,
      paladin.scope.repository,
      paladin.scope.registry,
      paladin.scope.instance,
      ...v.collect(Instance, paladin.instance, Mountpoint).map(({ value }) => value),
    ]);
  }

  // an instance HOME is never created here. everything below lives INSIDE one, so if the home is
  // absent the reference is wrong and scaffolding it turns a typo into a shelf entry — which is
  // exactly what `instance/doctor <typo>` used to do, silently, before any verb ran.
  const ledger = paladin.scope.ledger;
  if (ledger && !(await Deno.stat(ledger.absolute).catch(() => null))) return;

  const home = paladin.scope.instance;
  if (home && !(await Deno.stat(home.absolute).catch(() => null))) return;

  for (const mount of mounts.flat().filter(Boolean)) {
    await paladin.state.dir(mount.absolute);
  }
}

// lie.
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
//   //       paladin.env.get("VIVA_INSTANCE_MOUNT"),
//   //       paladin.env.get("VIVA_REGISTRY_MOUNT"),
//   //     ])
//   //     .throw();
// }

// validate migrated to prototypes/instance.js (part of instance.mount).

// export async function mount(paladin) {
// return await paladin.vip.mount(new Path(paladin.env.get("VIVA_VIP_MOUNT")));
// }

// export async function statements(paladin) {
//   const directories = [...Object.values(paladin.scope).map((p) => p.absolute)];

//   for (const dir of directories) {
//     await paladin.state.dir(dir);
//   }
// }

const label = (instance, pointer) =>
  pointer
    .split("/")
    .slice(1)
    .reduce((at, part) => {
      const slot = { daemons: "daemon", services: "service", clients: "client" }[at];
      if (slot) return `${slot}[${instance[at][part]?.manifest?.slug}]`;
      return /^\d+$/.test(part) ? `${at}[${part}]` : at ? `${at}.${part}` : part;
    }, "") || "instance";

const alive = (mask) => Boolean(mask) && !Object.values(mask.secrets ?? {}).some(is.empty);

const dormant = (instance, at, mask) => {
  const blank = Object.entries(mask?.secrets ?? {})
    .filter(([, value]) => is.empty(value))
    .map(([name]) => name);
  const why = mask ? `${mask.module} — empty ${blank.join(", ")}` : "nothing declared";
  console.warn(`[instance] ${at} filtered, ${why}`);
  instance.dormant.push(at);
  return false;
};

export function settle(instance) {
  const { Instance } = v.primitives.instance;
  instance.dormant = [];
  for (const daemon of instance.daemons) {
    const at = `daemon[${daemon.manifest?.slug}]`;
    daemon.hallucinators = (daemon.hallucinators ?? []).filter(
      (mask, index) => alive(mask) || dormant(instance, `${at}.hallucinators[${index}]`, mask),
    );
    daemon.consume = object.filter(
      daemon.consume ?? {},
      (slug) => alive(daemon.consume[slug]) || dormant(instance, `${at}.consume.${slug}`, daemon.consume[slug]),
    );
  }
  Instance.cast(instance);
  const faults = Instance.faults(instance).map(({ at, reason }) => `${label(instance, at)} ${reason}`);
  const echoed = (sentence) => {
    const source = sentence.replace(/^(?:daemon|service)\[[^\]]*\]\./, "");
    return source !== sentence && faults.includes(source);
  };
  instance.faults = faults.filter((sentence) => !echoed(sentence));
  if (!instance.faults.length) Instance.decode(instance);
}
