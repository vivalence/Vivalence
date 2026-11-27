import * as dotenv from "@std/dotenv";
import { isAbsolute, resolve as resolvePath } from "@std/path";
import { is, v } from "@vivalence/typology";
import { inherit, label, named } from "./2-resolution.js";
import { extend } from "../../gestalten/belt/faculties.js";
import { NOTHING } from "../../prototypes/instances.js";

export async function environment(paladin) {
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
const SLOTS = Object.keys(v.primitives.instance.LedgerRecipe.properties).filter(
  (slot) => !["manifest", "environment", "hallucinators"].includes(slot),
);

const optional = (schema) =>
  Object.fromEntries(
    Object.entries(schema?.properties ?? {}).map(([key, held]) => [
      key,
      schema.required?.includes(key) ? held : { ...held, "~optional": true },
    ]),
  );

export async function recipe(paladin) {
  const { instance } = paladin;
  if (!("instance" in paladin.scope)) throw new Error(NOTHING);
  const home = paladin.scope.instance.absolute;
  const file = paladin.find.recipe(paladin.scope.instance);
  if (!file) throw new Error(`instance.mount: no instance.viva.json or instance.viva.jsonc at ${home}`);
  const authored = await paladin.read.json(file);
  const own = Object.fromEntries(
    await Promise.all(Object.entries(authored).map(async ([slot, value]) => [slot, slot === "manifest" ? value : await paladin.read.part(file, value, slot)])),
  );
  const faults = v.primitives.instance.InstanceRecipe.faults(own);
  if (faults.length) throw new Error(`instance.mount: ${file.absolute} ${faults.map(({ at, reason }) => `${label(own, at)} ${reason}`).join(" · ")}`);

  const declared = own.environment ?? { type: "object", properties: {} };

  // the fold: ledger → instance, BEFORE a thunk fires. on a COPY — read.viva returns the live
  // module namespace. a slot the instance never declared is the ledger's; the environment schema
  // merges by KEY, the instance's key winning — the same unit the strata fold values by.
  const ledger = await paladin.ledger.recipe();
  const module = { ...own, source: file };
  instance.paladin.inherited = SLOTS.filter((slot) => inherit(module, ledger, slot));
  const supplied = ledger?.hallucinators ?? [];
  if (is.object(module.runtime))
    module.runtime = { ...module.runtime, hallucinators: extend(module.runtime.hallucinators ?? [], supplied) };
  const environment = v.interface([v.environment(optional(ledger?.environment))], v.environment(optional(declared)).properties, { additionalProperties: false });
  const retyped = Object.keys(environment.properties).filter((key) => v.isNever(environment.properties[key]));
  if (retyped.length)
    throw new Error(`instance.mount: ${file.absolute} environment ${retyped.join(" ")} retypes the ledger's key — an instance narrows a key, restating its type`);

  const record = [];
  const at = (label) => (declaration) => paladin.link.env(declaration, record, label);
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
          ? dress(`${label}.modes${named(entry, index)}`)(at(`${label}.modes${named(entry, index)}`)(entry))
          : entry
      ),
  });

  instance.manifest = module.manifest;
  instance.environment = environment;
  instance.runtime = is.object(module.runtime) ? dressed("runtime")(module.runtime) : at("runtime")(module.runtime);
  instance.lighthouse = is.object(module.lighthouse)
    ? at("lighthouse")(module.lighthouse)
    : is.object(instance.runtime) && is.object(instance.runtime.secrets)
    ? v.primitives.instance.LighthouseMask.cast({ secrets: { jwt: instance.runtime.secrets.jwt }, traits: [] })
    : undefined;
  instance.datamap = at("datamap")(module.datamap);

  instance.clients = (module.clients ?? []).map((declaration) => dressed(`clients.${slug(declaration)}`)(declaration));
  instance.services = (module.services ?? []).map((declaration) => at(`services.${slug(declaration)}`)(declaration));
  instance.daemons = (module.daemons ?? []).map((declaration) => dressed(`daemons.${slug(declaration)}`)(declaration));
  instance.telemetry = module.telemetry;
  instance.paladin.requirements = record;
}
