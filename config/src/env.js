import { load } from "$std/dotenv/mod.ts";
import { join, dirname } from "@std/path";

export default async function (config) {
  const currentDir = new URL(".", import.meta.url).pathname;
  const envPath = new URL("../../.env", import.meta.url).pathname;
  // another way would be to load it from the deno.env. as in Deno.config.jsonpath

  // here check if this is the first time the repo is run / if its run without .env file.
  // in that case, compute the .env file from source.
  // validate that this is actually root by checking if deno.jsonc contains key:val

  // config.env should  check if there is an .env, if not copy .env.source
  //
  config.env = {
    ...(config?.env || {}),
    set: (key, value) => {
      config.env[key] = value;
      Deno.env.set(key, value);
      return value;
    },
    write: (key, value) => {
      config.env.set(key, value);
      // write to filesystem.
      return value;
    },
    get: (key, fallback = null, persist = false) => {
      return (
        config.env[key] ??
        (() => {
          // lol
          if (typeof fallback === "string" && persist !== false)
            return config.env.write(key, fallback);
          if (typeof fallback === "string") return fallback;
        })()
      );

      // (fallback && persist) ? config.env.set(key, fallback) : null;
    },
  };

  const env = await load({
    envPath,
    allowEmptyValues: true,
  });

  const VIVA_REPO_ROOT_DIR = env["VIVA_REPO_ROOT_DIR"];
  if (!VIVA_REPO_ROOT_DIR) throw new Error("[config] Missing repo configuration.");
  // config.env.write("VIVA_REPO_ROOT_DIR", join(import.module.path, selfOffset));

  const VIVA_DATABASE_PATH = join(VIVA_REPO_ROOT_DIR, env.VIVA_DATABASE_PATH);
  if (!VIVA_DATABASE_PATH) throw new Error("[config] Missing database configuration.");

  config.env = {
    ...config.env,
    DENO_ENV: "development",
    VIVA_ROLE: Deno.env.get("VIVA_ROLE"),
    VIVA_REPO_ROOT_DIR,
    VIVA_DATABASE_PATH,
    VIVA_DATABASE_MIGRATIONS_PATH: `${dirname(VIVA_DATABASE_PATH)}/migrations`,
    VIVA_MODULES_DIR: `${VIVA_REPO_ROOT_DIR}/modules`,
    VIVA_PACKAGES_DIR: `${VIVA_REPO_ROOT_DIR}/packages`,
    VIVA_RUNTIMES_DIR: `${VIVA_REPO_ROOT_DIR}/runtimes`,
    VIVA_SCHEMA_ROOT_DIR: `${VIVA_REPO_ROOT_DIR}/packages/schema`,
    VIVA_DAEMON_URL: env.VIVA_DAEMON_URL,
    VIVA_DAEMON_PORT: env.VIVA_DAEMON_PORT,
    VIVA_CLIENT_WEB_URL: env.VIVA_CLIENTS_WEB_URL,

    // DEPRACATED
    // DAEMON_URL: env.DAEMON_URL, // DEPRACATED
    // CLIENTS_USER_URL: env.CLIENTS_USER_URL, // VIVA_
    // SUPABASE_URL: env.SUPABASE_URL,
    // SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
  };

  if (Deno.env.get("VIVA_ROLE") === "daemon") {
    config.env = {
      ...config.env,

      CACHE_AGE_SECONDS: 1,
      INSTALL_CHUNK_SIZE: 100,
      INSTALL_CHUNKING_THRESHOLD: 100,
      INSTRUCTION_PROVISION_FLOOR: 2,

      // DATABASE_PORT: env.DATABASE_PORT,
      // DATABASE_SCHEMA: env.DATABASE_SCHEMA,
      // DATABASE_DB: env.DATABASE_DB,
      // DATABASE_USER: env.DATABASE_USER,
      // DATABASE_PASSWORD: env.DATABASE_PASSWORD,

      SERVICE_NLP_URL: env.SERVICE_NLP_URL,
      SERVICE_NLP_PORT: env.SERVICE_NLP_PORT,
      SERVICE_NLP_KEY: env.SERVICE_NLP_KEY,

      VIVALENCE_IDENTITY_KEY: env.VIVALENCE_IDENTITY_KEY,
      OPENAI_API_KEY: env.OPENAI_API_KEY,
      PERPLEXITY_API_KEY: env.PERPLEXITY_API_KEY,
      ANYSCALE_API_KEY: env.ANYSCALE_API_KEY,
      GROQ_API_KEY: env.GROQ_API_KEY,
      ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,

      // SUPABASE_SERVICE_KEY: env.SUPABASE_SERVICE_KEY,
    };
  }
  if (Deno.env.get("VIVA_ROLE") === "client") {
    config.env = {
      LOCAL_INSTRUCTION_QUEUE_FLOOR: 2, // maybe sourced/controlled/patched by tactic.
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

  for (const [key, value] of Object.entries(config.env)) {
    if (typeof value === "string") {
      if (value === "true") config.env[key] = true;
      if (value === "false") config.env[key] = false;
      if (!isNaN(value)) config.env[key] = Number(value);
      // TODO
      // if (value.startsWith("http")) env[key] = new URL(value);
      // if (value.startsWith("file:")) env[key] = new URL(value);
    }
  }

  for (const [key, value] of Object.entries(config.env)) {
    Deno.env.set(key, value);
    // does this scope also have write rights?
  }

  config.isDev = config.env.DENO_ENV === "development";
  config.isProd = config.env.DENO_ENV === "production";
  return config;
}
