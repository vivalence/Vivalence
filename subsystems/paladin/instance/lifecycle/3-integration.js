import { is, object, v } from "@vivalence/typology";
import { extend } from "../../gestalten/belt/faculties.js";
import { label, named } from "./2-resolution.js";
import { faults as logged } from "../../prototypes/telemetry.js";

const { TIERS } = v.primitives.hallucination;

const alive = (mask) => Boolean(mask) && !Object.values(mask.secrets ?? {}).some(is.empty);

const dormant = (instance, at, mask) => {
  const blank = Object.entries(mask?.secrets ?? {})
    .filter(([, value]) => is.empty(value))
    .map(([name]) => name);
  const why = mask ? `${mask.module} — empty ${blank.join(", ")}` : "nothing declared";
  console.warn(`[instance] ${at} filtered, ${why}`);
  // the row names what lived there: a reader sees the module, never just an index into a roster it can no longer count
  instance.paladin.dormant.push({ at, module: mask?.module ?? null, empty: blank });
  return false;
};

const awake = (instance, at, masks = []) =>
  masks.filter((mask, index) => alive(mask) || dormant(instance, `${at}.hallucinators[${index}]`, mask));

function unfold(instance) {
  const { runtime } = instance;
  if (!runtime) return;
  for (const mode of runtime.modes) mode.hallucinators = extend(mode.hallucinators, runtime.hallucinators);
  for (const service of instance.services) service.hallucinators = extend(service.hallucinators, runtime.hallucinators);
  for (const daemon of instance.daemons) {
    daemon.hallucinators = extend(daemon.hallucinators, runtime.hallucinators);
    for (const mode of daemon.modes) mode.hallucinators = extend(mode.hallucinators, daemon.hallucinators);
  }
}

const wrong = (host) =>
  host.hallucinators
    .flatMap((mask) => mask.faculties)
    .filter((faculty) => ![undefined, faculty.type].includes(TIERS[faculty.tier]?.type))
    .map((faculty) => `${faculty.id} wears ${faculty.tier} as ${faculty.type}`);

const misworn = (at, host, above = { hallucinators: [] }) =>
  wrong(host)
    .filter((sentence) => !wrong(above).includes(sentence))
    .map((sentence) => `${at} ${sentence}`);

function worn(instance) {
  const { runtime } = instance;
  if (!runtime) return [];
  return [
    ...misworn("runtime", runtime),
    ...runtime.modes.flatMap((mode, index) => misworn(`runtime.modes${named(mode, index)}`, mode, runtime)),
    ...instance.services.flatMap((service) =>
      misworn(`services.${service.manifest.slug}`, service, runtime),
    ),
    ...instance.daemons.flatMap((daemon) => {
      const at = `daemons.${daemon.manifest.slug}`;
      return [
        ...misworn(at, daemon, runtime),
        ...daemon.modes.flatMap((mode, index) => misworn(`${at}.modes${named(mode, index)}`, mode, daemon)),
      ];
    }),
  ];
}

export function settle(paladin) {
  const { instance } = paladin;
  const { InstanceMask } = v.primitives.instance;
  instance.paladin.dormant = [];
  const modes = (at, host) =>
    host.modes.forEach((mode, index) => {
      mode.hallucinators = awake(instance, `${at}.modes${named(mode, index)}`, mode.hallucinators);
    });
  if (instance.runtime) {
    instance.runtime.hallucinators = awake(instance, "runtime", instance.runtime.hallucinators);
    modes("runtime", instance.runtime);
  }
  for (const service of instance.services)
    service.hallucinators = awake(instance, `services.${service.manifest?.slug}`, service.hallucinators);
  for (const daemon of instance.daemons) {
    const at = `daemons.${daemon.manifest?.slug}`;
    daemon.hallucinators = awake(instance, at, daemon.hallucinators);
    modes(at, daemon);
    daemon.consume = object.filter(
      daemon.consume ?? {},
      (slug) => alive(daemon.consume[slug]) || dormant(instance, `${at}.consume.${slug}`, daemon.consume[slug]),
    );
  }
  unfold(instance);
  InstanceMask.cast(instance);
  const faults = [
    ...InstanceMask.faults(instance).map(({ at, reason }) => `${label(instance, at)} ${reason}`),
    ...worn(instance),
    ...logged(instance.telemetry),
  ];
  // required BECAUSE daemons are declared — the schematic cannot say it; a blank read is the env row's, not this
  if (instance.daemons.length && instance.runtime && !("remote" in instance.runtime.statics))
    faults.push(`runtime.statics.remote required — ${instance.daemons.length} daemons announce under it`);
  const echoed = (sentence) => {
    const source = sentence.replace(/^(?:daemons|services)\.[^.]+\./, "");
    return source !== sentence && faults.includes(source);
  };
  instance.paladin.faults = faults.filter((sentence) => !echoed(sentence));
  if (!instance.paladin.faults.length) InstanceMask.decode(instance);
}
