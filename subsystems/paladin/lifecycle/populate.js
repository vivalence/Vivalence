import * as dotenv from "@std/dotenv";
import { isAbsolute, join } from "@std/path";
import { object, Path } from "@vivalence/typology";

const keys = {
  public: (key) => key.startsWith("VIVA_") || key.startsWith("PUBLIC_VIVA_"),
  secret: (key) => key.startsWith("SECRET_VIVA_"),
};

export async function env(paladin) {
  const os = Deno.env.toObject();
  paladin.env.assign(object.filter(os, keys.public), "os");
  paladin.secret.assign(object.filter(os, keys.secret), "os");

  const cwd = Deno.env.get("INIT_CWD") ?? Deno.env.get("PWD") ?? Deno.cwd();
  const local = `${cwd}/.env`;
  if (await Deno.stat(local).catch(() => null)) {
    const vars = await dotenv.load({ envPath: local });
    paladin.env.assign(object.filter(vars, keys.public), ".env");
    paladin.secret.assign(object.filter(vars, keys.secret), ".env");
  }

  if (Deno.env.has("VIVA_ENV_FILE")) {
    const envPath = Deno.env.get("VIVA_ENV_FILE");
    const vars = await dotenv.load({ envPath });
    const held = object.filter(vars, keys.public);
    const secrets = object.filter(vars, keys.secret);
    if (!Object.keys(held).length && !Object.keys(secrets).length)
      throw new Error(`[PALADIN] VIVA_ENV_FILE ${envPath}: no VIVA_* knowledge in it`);
    paladin.env.assign(held, ".env");
    paladin.secret.assign(secrets, ".env");
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
        const reference = paladin.env.get("VIVA_INSTANCE_MOUNT");
        if (!reference.includes("/") && !reference.startsWith("."))
          return paladin.scope.ledger.branch(`instances/${reference}`);
        if (isAbsolute(reference)) return new Path(reference);
        return paladin.source(reference);
      },
    ],

    [
      "environment",
      () =>
        paladin.env.has("VIVA_ENVIRONMENT_MOUNT") || (paladin.scope.instance && paladin.is.citizen),
      () => {
        const envpath = paladin.env.get("VIVA_ENVIRONMENT_MOUNT") ??
          paladin.scope.instance.branch("environment").absolute;
        return envpath ? new Path(envpath) : undefined;
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
    if (session) paladin.env.assign(session, "session");
  }

  const held = await paladin.read.json(paladin.scope.ledger.branch("environment.json"), null);
  if (held) paladin.env.assign(held, "ledger");
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
//       // "VIVA_CLIENT_KAJUIT_SERVE", // conditional
//       // "PUBLIC_VIVA_RUNTIME_REMOTE", // conditional
//       // "PUBLIC_VIVA_LIGHTHOUSE_REMOTE", // conditional
//       // "PUBLIC_VIVA_CLIENT_KAJUIT_REMOTE", // conditional
//     ])
//     .throw();
// }
