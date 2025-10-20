import * as dotenv from "@std/dotenv";
import { Env, Path } from "@vivalence/typology";
//+ await import("@vivalence/vip");

export async function env(paladin) {
  console.log("ENV CALL");
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
      "VIVA_VIP_MOUNT",
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

  const allJsonFiles = await paladin.find.json(paladin.join.variant.env());

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

export async function system(paladin) {
  paladin.system = {
    mount: new Path(paladin.env.get("VIVA_SYSTEM_MOUNT")),
    // importmap: await paladin.read.json(paladin.join.system("import_map.json")),
  };
  paladin.tilde = {
    mount: new Path(paladin.env.get("VIVA_TILDE_MOUNT")),
    //
  };
}

export async function vip(paladin) {
  const { Vip } = await import("@vivalence/vip");
  paladin.vip = new Vip(paladin);
}

export async function modeselector(paladin) {
  const { VIVA_SYSTEM_MODE, VIVA_SYSTEM_ROLE } = paladin.env.vars;

  paladin.mode = VIVA_SYSTEM_MODE;
  paladin.role = VIVA_SYSTEM_ROLE;

  paladin.is = {
    build: VIVA_SYSTEM_MODE === "BUILD",
    dev: VIVA_SYSTEM_MODE === "DEVELOPMENT",
    prod: VIVA_SYSTEM_MODE === "PRODUCTION",
  };
}

export async function statements(paladin) {
  const directories = [
    paladin.env.get("VIVA_SYSTEM_MOUNT"),
    paladin.env.get("VIVA_TILDE_MOUNT"),
    paladin.env.get("VIVA_VIP_MOUNT"),
  ];

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
      "VIVA_VIP_MOUNT",

      "VIVA_DAEMON_SERVE",
      "VIVA_GAIA_SERVE",
      "VIVA_CLIENT_HTML_SERVE",

      "PUBLIC_VIVA_DAEMON_REMOTE",
      "PUBLIC_VIVA_GAIA_REMOTE",
      "PUBLIC_VIVA_CLIENT_HTML_REMOTE",
    ])
    .throw();

  paladin.check
    .path([
      paladin.env.get("VIVA_SYSTEM_MOUNT"),
      paladin.env.get("VIVA_TILDE_MOUNT"),
      paladin.env.get("VIVA_VIP_MOUNT"),
    ])
    .throw();
}
