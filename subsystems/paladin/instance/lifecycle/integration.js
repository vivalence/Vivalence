import { is, object, v } from "@vivalence/typology";

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
  // the row names what lived there: a reader sees the module, never just an index into a roster it can no longer count
  instance.dormant.push({ at, module: mask?.module ?? null, empty: blank });
  return false;
};

export function settle(instance) {
  const { Instance } = v.primitives.instance;
  instance.dormant = [];
  instance.hallucinators = (instance.hallucinators ?? []).filter(
    (mask, index) => alive(mask) || dormant(instance, `hallucinators[${index}]`, mask),
  );
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
  // required BECAUSE daemons are declared — the schematic cannot say it; a blank read is the env row's, not this
  if (instance.daemons.length && instance.runtime && !("remote" in instance.runtime.statics))
    faults.push(`runtime.statics.remote required — ${instance.daemons.length} daemons announce under it`);
  const echoed = (sentence) => {
    const source = sentence.replace(/^(?:daemon|service)\[[^\]]*\]\./, "");
    return source !== sentence && faults.includes(source);
  };
  instance.faults = faults.filter((sentence) => !echoed(sentence));
  if (!instance.faults.length) Instance.decode(instance);
}
