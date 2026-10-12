import * as dotenv from "@std/dotenv";
import { isAbsolute, join } from "@std/path";
import { Path, v } from "@vivalence/typology";
import { Instance } from "../instance/prototype.js";

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
            new URL("../../../", import.meta.url).pathname, // paladin → paladin → subsystems → repo
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

export function instance(paladin) {
  paladin.instance = new Instance(paladin);
  return paladin.instance;
}

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
  // absent the token is wrong and scaffolding it turns a typo into a shelf entry — which is
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
