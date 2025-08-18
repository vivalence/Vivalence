import { Env } from "@vivalence/typology/prototypes";
import * as dotenv from "@std/dotenv";

export async function repoloader(config) {
  let { VIVA_REGISTER_DIR } = config.env.vars;
  config.registry = { register: VIVA_REGISTER_DIR };
}

export async function envloaders(config) {
  const checked = config.check.env([
    "VIVA_REPOSITORY_DIR",
    "VIVA_CONFIG_DIR",
    "VIVA_REGISTER_DIR",
  ]);

  if (checked.length > 0) {
    const ROOT_OFFSET = "../../../.env";
    const envPath = new URL(ROOT_OFFSET, import.meta.url).pathname;
    const env = await dotenv.load({ envPath });
    config.env.assign(env);
  }

  if (Deno.env.has("VIVA_ENV_FILE")) {
    const envPath = Deno.env.get("VIVA_ENV_FILE");
    config.env.assign(await dotenv.load({ envPath }));
  }
}
export async function modeselector(config) {
  let {
    VIVA_CONFIG_DIR,
    VIVA_SYSTEM_MODE,
    VIVA_SYSTEM_ROLE,
    VIVA_SYSTEM_VARIANT,
  } = config.env.vars;

  config.env.assign({
    VIVA_DATA_DIR: `${VIVA_CONFIG_DIR}/data`,
  });

  if (!VIVA_SYSTEM_VARIANT) {
    VIVA_SYSTEM_VARIANT = `${VIVA_SYSTEM_MODE}_${VIVA_SYSTEM_ROLE}`;
    config.env.set("VIVA_SYSTEM_VARIANT", VIVA_SYSTEM_VARIANT);
  }

  config.system.mode = VIVA_SYSTEM_MODE;
  config.system.role = VIVA_SYSTEM_ROLE;
  config.system.variant = VIVA_SYSTEM_VARIANT;

  config.is = {
    build: VIVA_SYSTEM_MODE === "BUILD",
    dev: VIVA_SYSTEM_MODE === "DEVELOPMENT",
    prod: VIVA_SYSTEM_MODE === "PRODUCTION",
  };
}

export async function checks(config) {
  config.check
    .path([
      // pull this from system variant.preflight.path
      config.env.get("VIVA_REPOSITORY_DIR"),
      config.env.get("VIVA_CONFIG_DIR"),
      config.env.get("VIVA_REGISTER_DIR"),
      config.env.get("VIVA_DATA_DIR"),
    ])
    ?.throw();
}

// VIVA_SYSTEM_MODE="DEVELOPMENT" # SERVICE BUILD TESTING PRODUCTION
// "VIVA_SYSTEM_DIR", "VIVA_CONFIG_DIR", "VIVA_DATA_DIR", "VIVA_REGISTER_DIR",
// VIVA_SYSTEM_ROLE="DAEMON" # CLIENT SERVICE SUDO
// VIVA_SYSTEM_VARIANT="BUILD_CLIENT" # CLIENT SERVICE SUDO
