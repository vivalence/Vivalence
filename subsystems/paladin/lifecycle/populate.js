import * as dotenv from "@std/dotenv";
import { Env, Path } from "@vivalence/typology";

export async function env(paladin) {
  // console.log("ENV CALL");
  // read process env
  for (const [key, value] of Object.entries(Deno.env.toObject())) {
    if (key.startsWith("VIVA_")) paladin.env.set(key, value);
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
      "VIVA_TILDE_MOUNT",
      "VIVA_REGISTRY_MOUNT",
    ]).fails
  ) {
    const ROOT_OFFSET = "../../../.env";
    const envPath = new URL(ROOT_OFFSET, import.meta.url).pathname;
    const env = await dotenv.load({ envPath });
    paladin.env.assign(env);
  }
}

export async function environment(paladin) {
  const apply = (env) => async (path) => {
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

export async function modeselector(paladin) {
  // getter
  paladin.role = paladin.env.get("VIVA_SYSTEM_ROLE");
  paladin.mode = paladin.env.get("VIVA_SYSTEM_MODE");
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
      // "VIVA_TILDE_MOUNT", // conditional
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
