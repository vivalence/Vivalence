import { Env, Path } from "@vivalence/typology";
import * as dotenv from "@std/dotenv";

export async function envloaders(config) {
  if (Deno.env.has("VIVA_ENV_FILE")) {
    const envPath = Deno.env.get("VIVA_ENV_FILE");
    config.env.assign(await dotenv.load({ envPath }));
  }

  const checked = config.check.env([
    "VIVA_REPOSITORY_DIR",
    "VIVA_CONFIG_DIR",
    "VIVA_REGISTER_DIR",
  ]);

  if (checked?.length > 0) {
    const ROOT_OFFSET = "../../../.env";
    const envPath = new URL(ROOT_OFFSET, import.meta.url).pathname;
    const env = await dotenv.load({ envPath });
    config.env.assign(env);
  }

  for (const [key, value] of Object.entries(Deno.env.toObject())) {
    if (key.startsWith("VIVA_")) {
      config.env.set(key, value);
    }
  }
}

export async function repoloader(config) {
  const { VIVA_REGISTER_DIR, VIVA_REPOSITORY_DIR, VIVA_CONFIG_DIR } =
    config.env.vars;

  // if (config.check.env(["VIVA_VARIANT_DIR"]).length > 0) {config.env.assign({VIVA_VARIANT_DIR: `${VIVA_CONFIG_DIR}/variant`,});}

  // console.log(config.check, config.check.env(["VIVA_DATA_DIR"]));
  if (config.check.env(["VIVA_DATA_DIR"])?.length > 0) {
    config.env.assign({
      VIVA_DATA_DIR: `${VIVA_CONFIG_DIR}/data`,
    });
  }

  config.repository = { path: new Path(VIVA_REPOSITORY_DIR) };
  config.registry = {
    path: new Path(VIVA_REGISTER_DIR),
    register: VIVA_REGISTER_DIR,
  };
}

export async function modeselector(config) {
  let { VIVA_SYSTEM_MODE, VIVA_SYSTEM_ROLE, VIVA_SYSTEM_VARIANT } =
    config.env.vars;

  if (!VIVA_SYSTEM_VARIANT) {
    VIVA_SYSTEM_VARIANT = `${VIVA_SYSTEM_MODE}_${VIVA_SYSTEM_ROLE}`;
    config.env.set("VIVA_SYSTEM_VARIANT", VIVA_SYSTEM_VARIANT);
  }

  config.mode = VIVA_SYSTEM_MODE;
  config.role = VIVA_SYSTEM_ROLE;
  config.variant = VIVA_SYSTEM_VARIANT;

  config.is = {
    build: VIVA_SYSTEM_MODE === "BUILD",
    dev: VIVA_SYSTEM_MODE === "DEVELOPMENT",
    prod: VIVA_SYSTEM_MODE === "PRODUCTION",
  };
  // VIVA_SYSTEM_MODE="DEVELOPMENT" # SERVICE BUILD TESTING PRODUCTION
  // VIVA_SYSTEM_ROLE="DAEMON" # CLIENT SERVICE SUDO
  // VIVA_SYSTEM_VARIANT="BUILD_CLIENT" # CLIENT SERVICE SUDO
}

export async function filesystem(config) {
  const directories = [
    config.env.get("VIVA_REPOSITORY_DIR"),
    config.env.get("VIVA_CONFIG_DIR"),
    config.env.get("VIVA_REGISTER_DIR"),
    config.env.get("VIVA_DATA_DIR"),
    // assets // runtimes // variant
  ];

  for (const dir of directories) {
    await config.state.path(dir);
  }
}

export async function checks(config) {
  config.check
    .path([
      // pull this from system variant.construct.path
      config.env.get("VIVA_REPOSITORY_DIR"),
      config.env.get("VIVA_CONFIG_DIR"),
      config.env.get("VIVA_REGISTER_DIR"),
      config.env.get("VIVA_DATA_DIR"),
    ])
    ?.throw();
}
