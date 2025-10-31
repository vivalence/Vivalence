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

  const allJsonFiles = await paladin.find.json(paladin.join.environment());

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
  paladin.role = paladin.env.get("VIVA_SYSTEM_ROLE");
  paladin.mode = paladin.env.get("VIVA_SYSTEM_MODE");
}

// tool.
export async function scopes(paladin) {
  paladin.scope = {
    system: new Path(paladin.env.get("VIVA_SYSTEM_MOUNT")),
    tilde: new Path(paladin.env.get("VIVA_TILDE_MOUNT")),
    registry: new Path(paladin.env.get("VIVA_REGISTRY_MOUNT")),
    variant: new Path(paladin.env.get("VIVA_TILDE_MOUNT")).branch("variant"),
  };
  // importmap: await paladin.read.json(paladin.join.system("import_map.json")),
}

export async function veryimportantpackage(paladin) {
  if (paladin.is.veryimportant) {
    const { Vip } = await import("@vivalence/paladin/typology");

    paladin.vip = new Vip(paladin);
  }
}

export async function statements(paladin) {
  const directories = [...Object.values(paladin.scope).map((p) => p.absolute)];

  for (const dir of directories) {
    await paladin.state.dir(dir);
  }
}

export async function questions(paladin) {
  paladin.check
    .env([
      "VIVA_SYSTEM_MODE",
      "VIVA_SYSTEM_ROLE",

      "VIVA_SYSTEM_MOUNT",
      "VIVA_TILDE_MOUNT",
      "VIVA_REGISTRY_MOUNT",

      "VIVA_GAIA_SERVE",
      "VIVA_LIGHTHOUSE_SERVE",
      "VIVA_CLIENT_HUT_SERVE",

      "PUBLIC_VIVA_GAIA_REMOTE",
      "PUBLIC_VIVA_LIGHTHOUSE_REMOTE",
      "PUBLIC_VIVA_CLIENT_HUT_REMOTE",
    ])
    .throw();

  paladin.check
    .path([
      paladin.env.get("VIVA_SYSTEM_MOUNT"),
      paladin.env.get("VIVA_TILDE_MOUNT"),
      paladin.env.get("VIVA_REGISTRY_MOUNT"),
    ])
    .throw();
}
