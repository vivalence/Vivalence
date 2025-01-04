import { load } from "$std/dotenv/mod.ts";
import { join } from "$std/path/mod.ts";

export default async function (config) {
  const REPO_ROOT_DIR = Deno.cwd();

  const env = await load({
    allowEmptyValues: true,
    envPath: join(REPO_ROOT_DIR, ".env"),
  });

  const DATABASE_PATH = join(REPO_ROOT_DIR, env.DATABASE_PATH);

  config.env = {
    ...(config?.env || {}),
    get: (key) => config.env[key],
    DENO_ENV: "development",
    VIVA_ROLE: Deno.env.get("VIVA_ROLE"),
    VIVA_MODULES_DIR: `${REPO_ROOT_DIR}/modules`,
    DAEMON_URL: env.DAEMON_URL,
    CLIENTS_USER_URL: env.CLIENTS_USER_URL,
    DATABASE_PATH,
    SCHEMA_ROOT_DIR: `${REPO_ROOT_DIR}/packages/schema`,

    QUEUE_THRESHOLD: 8,
    CACHE_AGE_SECONDS: 1,
    INSTALL_CHUNK_SIZE: 500,

    // DEPRACATED
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
  };

  if (Deno.env.get("VIVA_ROLE") === "daemon") {
    config.env = {
      ...config.env,
      PROVISION_THRESHOLD: 2,
      DAEMON_PORT: env.DAEMON_PORT,

      VIVA_PACKAGES_DIR: `${REPO_ROOT_DIR}/packages`,
      VIVA_RUNTIMES_DIR: `${REPO_ROOT_DIR}/runtimes`,

      DATABASE_PORT: env.DATABASE_PORT,
      DATABASE_SCHEMA: env.DATABASE_SCHEMA,
      DATABASE_DB: env.DATABASE_DB,
      DATABASE_USER: env.DATABASE_USER,
      DATABASE_PASSWORD: env.DATABASE_PASSWORD,

      SERVICE_NLP_URL: env.SERVICE_NLP_URL,
      SERVICE_NLP_KEY: env.SERVICE_NLP_KEY,
      OPENAI_API_KEY: env.OPENAI_API_KEY,
      PERPLEXITY_API_KEY: env.PERPLEXITY_API_KEY,
      ANYSCALE_API_KEY: env.ANYSCALE_API_KEY,
      GROQ_API_KEY: env.GROQ_API_KEY,
      ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,

      SUPABASE_SERVICE_KEY: env.SUPABASE_SERVICE_KEY,
    };
  }
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

  for (const [key, value] of Object.entries(config.env)) {
    Deno.env.set(key, value);
  }

  config.isDev = config.env.DENO_ENV === "development";
  config.isProd = config.env.DENO_ENV === "production";
  return config;
}
