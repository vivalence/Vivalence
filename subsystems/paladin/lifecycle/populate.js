import * as dotenv from "@std/dotenv";
import { isAbsolute, join } from "@std/path";
import { Path } from "@vivalence/typology";

export async function env(paladin) {
  for (const [key, value] of Object.entries(Deno.env.toObject())) {
    if (key.startsWith("VIVA_") || key.startsWith("PUBLIC_VIVA_")) paladin.env.set(key, value);
    if (key.startsWith("SECRET_VIVA_")) paladin.secret.set(key, value);
  }

  if (Deno.env.has("VIVA_ENV_FILE")) {
    const envPath = Deno.env.get("VIVA_ENV_FILE");
    paladin.env.assign(await dotenv.load({ envPath }));
  }

  // fallback to repo .env
  // if (paladin.check.env(["VIVA_REPOSITORY_MOUNT", "VIVA_VARIANT_MOUNT"]).fails && (paladin.is.citizen || paladin.is.dev)) {const ROOT_OFFSET = "../../../.env"; const envPath = new URL(ROOT_OFFSET, import.meta.url).pathname; const env = await dotenv.load({ envPath }); paladin.env.assign(env);}
  // fallback removed for configurable paladin.
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
      "variant",
      () => paladin.env.has("VIVA_VARIANT_MOUNT"),
      () => {
        const reference = paladin.env.get("VIVA_VARIANT_MOUNT");
        if (!reference.includes("/") && !reference.startsWith("."))
          return paladin.scope.ledger.branch(`variants/${reference}`);
        if (isAbsolute(reference)) return new Path(reference);
        return paladin.source(reference);
      },
    ],

    [
      "environment",
      () =>
        paladin.env.has("VIVA_ENVIRONMENT_MOUNT") || (paladin.scope.variant && paladin.is.citizen),
      () => {
        let envpath;
        if (Deno.env.has("VIVA_ENVIRONMENT_MOUNT")) {
          envpath = Deno.env.get("VIVA_ENVIRONMENT_MOUNT");
        } else {
          envpath = paladin.scope.variant.branch("environment").absolute;
        }
        return envpath ? new Path(envpath) : undefined;
      },
    ],
    [
      "mountpoint",
      () =>
        paladin.env.has("VIVA_MOUNTPOINT_MOUNT") || (paladin.scope.variant && paladin.is.citizen),
      () => {
        let envpath;
        if (Deno.env.has("VIVA_MOUNTPOINT_MOUNT")) {
          envpath = Deno.env.get("VIVA_MOUNTPOINT_MOUNT");
        } else {
          envpath = paladin.scope.variant.branch("mountpoint").absolute;
        }
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
}

// export async function questions(paladin) {
//   paladin.check
//     .env([
//       // "VIVA_SYSTEM_MODE",
//       // "VIVA_SYSTEM_ROLE",
//       // "VIVA_REPOSITORY_MOUNT", // conditional
//       // "VIVA_VARIANT_MOUNT", // conditional
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
