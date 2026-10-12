import * as dotenv from "@std/dotenv";
import { isAbsolute, resolve as resolvePath } from "@std/path";
import { is, v } from "@vivalence/typology";
import { inherit } from "./resolution.js";

export async function environment(instance) {
  const { paladin } = instance;
  if (!paladin.scope.instance) return;
  const file = paladin.scope.instance.branch(".env").absolute;
  if (!(await Deno.stat(file).catch(() => null))) return;
  paladin.claim(await dotenv.load({ envPath: file }), "instance", file);
}

const anchor = (home) => (entry) =>
  typeof entry !== "string"
    ? entry.module
      ? entry
      : { ...entry, source: entry.source ?? home }
    : isAbsolute(entry)
      ? entry
      : /^\.\.?\//.test(entry)
        ? resolvePath(home.dirname, entry)
        : entry;

// the slots a ledger may speak, from the schematic — manifest is each tier's own, environment folds
// key-wise below, everything else falls through WHOLE (a declared [] is "none", not "merge").
const SLOTS = Object.keys(v.primitives.instance.Ledger.properties).filter(
  (slot) => !["manifest", "environment"].includes(slot),
);

const optional = (schema) =>
  Object.fromEntries(
    Object.entries(schema?.properties ?? {}).map(([key, held]) => [
      key,
      schema.required?.includes(key) ? held : { ...held, "~optional": true },
    ]),
  );

export async function recipe(instance) {
  const { paladin } = instance;
  const home = instance.home.absolute;
  const file = instance.home.branch("instance.viva.json");
  const authored = await paladin.read.json(file).catch((error) => {
    if (error?.code === "ENOENT") throw new Error(`instance.mount: no instance.viva.json at ${home}`);
    throw error;
  });
  const own = Object.fromEntries(
    await Promise.all(Object.entries(authored).map(async ([slot, value]) => [slot, slot === "manifest" ? value : await paladin.read.part(file, value, slot)])),
  );
  const faults = v.primitives.instance.InstanceMask.faults(own);
  if (faults.length) throw new Error(`instance.mount: ${file.absolute} ${faults.map(({ at, reason }) => `${at} ${reason}`).join(" · ")}`);
  instance.raw = own;
  const declared = own.environment ?? { type: "object", properties: {} };

  // the fold: ledger → instance, BEFORE a thunk fires. on a COPY — read.viva returns the live
  // module namespace. a slot the instance never declared is the ledger's; the environment schema
  // merges by KEY, the instance's key winning — the same unit the strata fold values by.
  const ledger = await paladin.ledger.recipe();
  const module = { ...own, source: file };
  instance.inherited = SLOTS.filter((slot) => inherit(module, ledger, slot));
  const environment = v.interface([v.environment(optional(ledger?.environment))], v.environment(optional(declared)).properties, { additionalProperties: false });
  const retyped = Object.keys(environment.properties).filter((key) => v.isNever(environment.properties[key]));
  if (retyped.length)
    throw new Error(`instance.mount: ${file.absolute} environment ${retyped.join(" ")} retypes the ledger's key — an instance narrows a key, restating its type`);

  const record = [];
  const at = (label) => (declaration) => paladin.expand(declaration, record, label);
  const slug = (declaration) => declaration.manifest?.slug;
  const dress = (label) => (entry) => {
    const declared = entry.mountpoint;
    if (is.string(declared) && declared && !isAbsolute(declared))
      throw new Error(`instance.mount: ${label}.mountpoint must be absolute — ${declared}`);
    return entry;
  };
  const dressed = (label) => ({ modes = [], ...declaration }) => ({
    ...at(label)(declaration),
    modes: modes
      .map(anchor(module.source))
      .map((entry, index) =>
        is.object(entry) && is.string(entry.module)
          ? dress(`${label}.modes[${index}]`)(at(`${label}.modes[${index}]`)(entry))
          : entry
      ),
  });

  instance.manifest = module.manifest;
  instance.environment = environment;
  instance.runtime = is.object(module.runtime) ? dressed("runtime")(module.runtime) : at("runtime")(module.runtime);
  instance.lighthouse = is.object(module.lighthouse)
    ? at("lighthouse")(module.lighthouse)
    : is.object(instance.runtime) && is.object(instance.runtime.secrets)
    ? v.primitives.instance.Lighthouse.cast({ secrets: { jwt: instance.runtime.secrets.jwt }, traits: [] })
    : undefined;
  instance.datamap = at("datamap")(module.datamap);
  instance.hallucinators = at("hallucinators")(module.hallucinators);
  instance.clients = (module.clients ?? []).map((declaration) => dressed(`client[${slug(declaration)}]`)(declaration));
  instance.services = (module.services ?? []).map((declaration) => at(`service[${slug(declaration)}]`)(declaration));
  instance.daemons = (module.daemons ?? []).map((declaration) => dressed(`daemon[${slug(declaration)}]`)(declaration));
  instance.requirements = record;
}
