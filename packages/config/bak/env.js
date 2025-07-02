export default async function (config) {
  if (Deno.env.get("VIVA_ROLE") === "client") {
    config.env = {
      ...config.env,
      ...Object.entries(config.env).reduce((acc, [key, value]) => {
        return (acc[`PUBLIC_${key}`] = value.toString()), acc;
      }, {}),
    };
  }
  if (Deno.env.get("VIVA_ROLE") === "sudo") {
    config.env = {
      ...env,
      ...config.env,
    };
  }
  // const currentDir = new URL(".", import.meta.url).pathname;
  // const envPath = new URL("../../.env", import.meta.url).pathname;
  // const env = await load({ envPath, allowEmptyValues: true });

  // const VIVA_INSTANCE_ROOT_DIR = env["VIVA_INSTANCE_ROOT_DIR"];
  // if (!VIVA_INSTANCE_ROOT_DIR)
  //   throw new Error("[config] Missing data configuration.");

  // const VIVA_REPO_ROOT_DIR = env["VIVA_REPO_ROOT_DIR"];
  // if (!VIVA_REPO_ROOT_DIR)
  //   throw new Error("[config] Missing repo configuration.");

  // // config.env.write("VIVA_REPO_ROOT_DIR", join(import.module.path, selfOffset));
  // // const VIVA_DATABASE_PATH = join(VIVA_REPO_ROOT_DIR, env.VIVA_DATABASE_PATH); if (!VIVA_DATABASE_PATH) throw new Error("[config] Missing database configuration.");

  // config.env = {
  //   ...config.env,
  //   DENO_ENV: "development",
  //   VIVA_ROLE: Deno.env.get("VIVA_ROLE"),
  //   VIVA_REPO_ROOT_DIR,
  //   VIVA_INSTANCE_ROOT_DIR,

  //   VIVA_DATA_DIR: `${VIVA_INSTANCE_ROOT_DIR}/data`,
  //   VIVA_RUNTIMES_DIR: `${VIVA_INSTANCE_ROOT_DIR}/runtimes`,
  //   VIVA_MODULES_DIR: `${VIVA_INSTANCE_ROOT_DIR}/modules`,
  //   VIVA_SERVICES_DIR: `${VIVA_INSTANCE_ROOT_DIR}/services`,

  //   VIVA_DAEMON_URL: env.VIVA_DAEMON_URL,
  //   VIVA_DAEMON_PORT: env.VIVA_DAEMON_PORT,
  //   VIVA_CLIENT_WEB_URL: env.VIVA_CLIENTS_WEB_URL,

  //   // DEPRACATED
  //   // VIVA_DATABASE_PATH,
  //   // VIVA_DATABASE_MIGRATIONS_PATH: `${dirname(VIVA_DATABASE_PATH)}/migrations`,
  //   // VIVA_PACKAGES_DIR: `${VIVA_REPO_ROOT_DIR}/packages`,
  //   // VIVA_SCHEMA_ROOT_DIR: `${VIVA_REPO_ROOT_DIR}/packages/schema`,
  // };

  // if (Deno.env.get("VIVA_ROLE") === "daemon") {
  //   config.env = {
  //     ...config.env,

  //     CACHE_AGE_SECONDS: 1,

  //     VIVA_IDENTITY_MODE: env.VIVA_IDENTITY_MODE,

  //     // DEPRACATED:

  //     // DATABASE_SCHEMA: env.DATABASE_SCHEMA,
  //     // DATABASE_DB: env.DATABASE_DB,
  //     // DATABASE_USER: env.DATABASE_USER,
  //     // DATABASE_PASSWORD: env.DATABASE_PASSWORD,

  //     INSTALL_CHUNK_SIZE: 100,
  //     INSTALL_CHUNKING_THRESHOLD: 100,
  //     INSTRUCTION_PROVISION_FLOOR: 2,

  //     SERVICE_NLP_URL: env.SERVICE_NLP_URL,
  //     SERVICE_NLP_PORT: env.SERVICE_NLP_PORT,
  //     SERVICE_NLP_KEY: env.SERVICE_NLP_KEY,

  //     OPENAI_API_KEY: env.OPENAI_API_KEY,
  //     PERPLEXITY_API_KEY: env.PERPLEXITY_API_KEY,
  //     ANYSCALE_API_KEY: env.ANYSCALE_API_KEY,
  //     GROQ_API_KEY: env.GROQ_API_KEY,
  //     ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,
  //   };
  // }

  // for (const [key, value] of Object.entries(config.env)) {
  //   if (typeof value === "string") {
  //     if (value === "true") config.env[key] = true;
  //     if (value === "false") config.env[key] = false;
  //     if (!isNaN(value)) config.env[key] = Number(value);
  //     // TODO
  //     // if (value.startsWith("http")) env[key] = new URL(value);
  //     // if (value.startsWith("file:")) env[key] = new URL(value);
  //   }
  // }

  // for (const [key, value] of Object.entries(config.env)) {
  //   Deno.env.set(key, value);
  //   // does this scope also have write rights?
  // }

  // config.env = {
  //   ...config.env,
  //   set: (key, value) => {
  //     config.env[key] = value;
  //     Deno.env.set(key, value);
  //     return value;
  //   },
  //   write: (key, value) => {
  //     config.env.set(key, value);
  //     return value;
  //   },
  //   get: (key, fallback = null, persist = false) => {
  //     return (
  //       config.env[key] ??
  //       (() => {
  //         // lol
  //         if (typeof fallback === "string" && persist !== false)
  //           return config.env.write(key, fallback);
  //         if (typeof fallback === "string") return fallback;
  //       })()
  //     );

  //     // (fallback && persist) ? config.env.set(key, fallback) : null;
  //   },
  // };

  return config;
}
