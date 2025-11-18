import * as dotenv from "@std/dotenv";
import { Env, Path } from "@vivalence/typology";

export async function env(paladin) {
  // console.log("ENV CALL");
  // read process env
  for (const [key, value] of Object.entries(Deno.env.toObject())) {
    if (key.startsWith("VIVA_") || key.startsWith("PUBLIC_VIVA_"))
      paladin.env.set(key, value);
  }

  // read env file
  if (Deno.env.has("VIVA_ENV_FILE")) {
    const envPath = Deno.env.get("VIVA_ENV_FILE");
    paladin.env.assign(await dotenv.load({ envPath }));
  }

  // fallback to repo .env
  if (
    paladin.check.env([
      "VIVA_SYSTEM_MOUNT",
      "VIVA_VARIANT_MOUNT",
      "VIVA_REGISTRY_MOUNT",
    ]).fails
  ) {
    const ROOT_OFFSET = "../../../.env";
    const envPath = new URL(ROOT_OFFSET, import.meta.url).pathname;
    const env = await dotenv.load({ envPath });
    paladin.env.assign(env);
  }
}

export async function scopes(paladin) {
  paladin.scopes([
    [
      "system",
      () => true,
      () => new Path(paladin.env.get("VIVA_SYSTEM_MOUNT")),
    ],
    [
      "registry",
      () => Deno.env.has("VIVA_REGISTRY_MOUNT") || paladin.is.veryimportant,
      () => {
        let envpath;
        if (Deno.env.has("VIVA_REGISTRY_MOUNT")) {
          envpath = Deno.env.get("VIVA_REGISTRY_MOUNT");
        } else {
          envpath = paladin.scope.system.branch("registry").absolute;
        }
        return envpath ? new Path(envpath) : undefined;
      },
    ],
  ]);
  paladin.scopes([
    [
      "variant",
      () => paladin.env.has("VIVA_VARIANT_MOUNT"),
      () => new Path(paladin.env.get("VIVA_VARIANT_MOUNT")),
    ],

    [
      "circuitry",
      () => paladin.env.has("VIVA_CIRCUITRY_MOUNT") || paladin.scope.variant,
      () => {
        let envpath;
        if (Deno.env.has("VIVA_CIRCUITRY_MOUNT")) {
          envpath = Deno.env.get("VIVA_CIRCUITRY_MOUNT");
        } else {
          envpath = paladin.scope.variant.branch("circuitry").absolute;
        }
        return envpath ? new Path(envpath) : undefined;
      },
    ],
    [
      "environment",
      // () => !paladin.is.deployed && paladin.is.citizen,
      () => paladin.env.has("VIVA_ENVIRONMENT_MOUNT") || paladin.is.citizen,
      () => {
        let envpath;
        if (Deno.env.has("VIVA_ENVIRONMENT_MOUNT")) {
          envpath = Deno.env.get("VIVA_ENVIRONMENT_MOUNT");
        } else {
          envpath = paladin.scope.variant?.branch("environment").absolute;
        }
        return envpath ? new Path(envpath) : undefined;
      },
    ],
    [
      "mountpoint",
      () => paladin.is.citizen,
      () => {
        let envpath;
        if (Deno.env.has("VIVA_MOUNTPOINT_MOUNT")) {
          envpath = Deno.env.get("VIVA_MOUNTPOINT_MOUNT");
        } else {
          envpath = paladin.scope.variant?.branch("mountpoint").absolute;
        }
        return envpath ? new Path(envpath) : undefined;
      },
    ],
  ]);

  console.log(`system`, paladin.scope.system);
  console.log(`regist`, paladin.scope.registry);
  console.log(`varian`, paladin.scope.variant);
  console.log(`circui`, paladin.scope.circuitry);
  console.log(`enviro`, paladin.scope.environment);
  console.log(`mountp`, paladin.scope.mountpoint);
  // console.log({ paladin });

  paladin.scopes([
    // Legacy aliases
    [
      "circuits",
      () => paladin.scope.circuitry !== undefined,
      () => paladin.scope.circuitry,
    ],

    [
      "tilde",
      () => paladin.scope.variant !== undefined,
      () => paladin.scope.variant,
    ],
  ]);
}

export async function environment(paladin) {
  // console.log("scope", { scope: paladin.scope });
  if (!paladin.scope.environment) return;
  await paladin.state.dir(paladin.scope.environment.absolute);

  const apply = (env) => async (path) => {
    if (!path) return;
    return env.assign(await paladin.read.json(path));
  };

  const envpath = paladin.scope.environment.absolute;
  const allJsonFiles = await paladin.find.json(envpath);

  await Promise.all([
    apply(paladin.secret)(
      allJsonFiles.find((file) => file.absolute.includes("secret")),
    ),
    ...allJsonFiles
      .filter((file) => !file.absolute.includes("secret"))
      .map(apply(paladin.env)),
  ]);

  return paladin;
}

export async function veryimportantpackage(paladin) {
  if (paladin.is.veryimportant) {
    const { Vip } = await import("@vivalence/paladin/typology");
    paladin.vip = new Vip(paladin);
  }
}

export async function questions(paladin) {
  paladin.check
    .env([
      "VIVA_SYSTEM_MODE",
      "VIVA_SYSTEM_ROLE",

      // "VIVA_SYSTEM_MOUNT", // conditional
      // "VIVA_VARIANT_MOUNT", // conditional
      // "VIVA_REGISTRY_MOUNT", // conditional

      // "VIVA_RUNTIME_SERVE", // conditional
      // "VIVA_LIGHTHOUSE_SERVE", // conditional
      // "VIVA_CLIENT_HTML_SERVE", // conditional

      // "PUBLIC_VIVA_RUNTIME_REMOTE", // conditional
      // "PUBLIC_VIVA_LIGHTHOUSE_REMOTE", // conditional
      // "PUBLIC_VIVA_CLIENT_HTML_REMOTE", // conditional
    ])
    .throw();
}
