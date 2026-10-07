import * as dotenv from "@std/dotenv";
import { isAbsolute, join, resolve as resolvePath } from "@std/path";
import { is, Path, v } from "@vivalence/typology";
import { Instance } from "../prototypes/instance.js";
import { inherit } from "./resolve.js";

export async function env(paladin) {
  paladin.assign(Deno.env.toObject(), "os");

  const cwd = Deno.env.get("INIT_CWD") ?? Deno.env.get("PWD") ?? Deno.cwd();
  const local = `${cwd}/.env`;
  if (await Deno.stat(local).catch(() => null)) {
    paladin.observe(await dotenv.load({ envPath: local }), ".env", local);
  }

  if (Deno.env.has("VIVA_ENV_FILE")) {
    const envPath = Deno.env.get("VIVA_ENV_FILE");
    const { held, secrets } = paladin.claim(await dotenv.load({ envPath }), ".env", envPath);
    if (!Object.keys(held).length && !Object.keys(secrets).length)
      throw new Error(`[PALADIN] VIVA_ENV_FILE ${envPath}: no VIVA_* knowledge in it`);
  }
}

export async function scopes(paladin) {
  paladin.scopes([
    [
      "ledger",
      () => true,
      () => {
        const explicit = paladin.env.get("VIVA_LEDGER_MOUNT");
        return new Path(explicit ?? join(Deno.env.get("HOME"), ".viva"));
      },
    ],
  ]);
  paladin.scopes([
    [
      "instance",
      () => paladin.env.has("VIVA_INSTANCE_MOUNT"),
      () => {
        const token = paladin.env.get("VIVA_INSTANCE_MOUNT");
        // MOUNT MEANS PATH. a bare slug here is an upstream bug — resolving it silently is what
        // let `use` store one. the CLI resolves a slug via ledger.instances.resolve() before writing.
        if (!token.includes("/") && !token.startsWith("."))
          throw new Error(
            `[PALADIN] VIVA_INSTANCE_MOUNT="${token}" is a slug — a *_MOUNT is always a path. ` +
              `try: viva instances/use ${token}`,
          );
        if (isAbsolute(token)) return new Path(token);
        return paladin.source(token);
      },
    ],

    [
      "mountpoint",
      () =>
        paladin.env.has("VIVA_MOUNTPOINT_MOUNT") || (paladin.scope.instance && paladin.is.citizen),
      () => {
        const envpath = paladin.env.get("VIVA_MOUNTPOINT_MOUNT") ??
          paladin.scope.instance.branch("mountpoint").absolute;
        return envpath ? new Path(envpath) : undefined;
      },
    ],
  ]);
  paladin.scopes([
    [
      "repository",
      () => true,
      () =>
        new Path(
          paladin.env.get("VIVA_REPOSITORY_MOUNT") ??
            new URL("../../../", import.meta.url).pathname, // lifecycle → paladin → subsystems → repo
        ),
    ],
    [
      "registry",
      () => true,
      () => {
        if (paladin.env.has("VIVA_REGISTRY_MOUNT"))
          return new Path(paladin.env.get("VIVA_REGISTRY_MOUNT"));
        return paladin.scope.ledger.branch("registry");
      },
    ],
  ]);

  const shell = Deno.env.get("VIVA_PROCESS_ID");
  if (shell) {
    const session = await paladin.read.json(paladin.scope.ledger.branch(`sessions/${shell}.json`), null);
    if (session) paladin.assign(session, "session");
  }

  const machine = paladin.scope.ledger.branch(".env").absolute;
  if (await Deno.stat(machine).catch(() => null)) {
    paladin.claim(await dotenv.load({ envPath: machine }), "ledger", machine);
  }
}

// export async function questions(paladin) {
//   paladin.check
//     .env([
//       // "VIVA_SYSTEM_MODE",
//       // "VIVA_SYSTEM_ROLE",
//       // "VIVA_REPOSITORY_MOUNT", // conditional
//       // "VIVA_INSTANCE_MOUNT", // conditional
//       // "VIVA_REGISTRY_MOUNT", // conditional
//       // "VIVA_RUNTIME_SERVE", // conditional
//       // "VIVA_LIGHTHOUSE_SERVE", // conditional
//       // "VIVA_CLIENT_ANIMA_SERVE", // conditional
//       // "PUBLIC_VIVA_RUNTIME_REMOTE", // conditional
//       // "PUBLIC_VIVA_LIGHTHOUSE_REMOTE", // conditional
//       // "PUBLIC_VIVA_CLIENT_ANIMA_REMOTE", // conditional
//     ])
//     .throw();
// }

export function instance(paladin) {
  paladin.instance = new Instance(paladin);
  return paladin.instance;
}

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
  const bearer = (label) => ({ modes = [], ...declaration }) => ({
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
  instance.runtime = is.object(module.runtime) ? bearer("runtime")(module.runtime) : at("runtime")(module.runtime);
  instance.datamap = at("datamap")(module.datamap);
  instance.hallucinators = at("hallucinators")(module.hallucinators);
  instance.clients = (module.clients ?? []).map((declaration) => at(`client[${slug(declaration)}]`)(declaration));
  instance.services = (module.services ?? []).map((declaration) => at(`service[${slug(declaration)}]`)(declaration));
  instance.daemons = (module.daemons ?? []).map((declaration) => bearer(`daemon[${slug(declaration)}]`)(declaration));
  instance.requirements = record;
}
