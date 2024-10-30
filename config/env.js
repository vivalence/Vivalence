import { load } from "$std/dotenv/mod.ts";
import { dirname, fromFileUrl, join } from "$std/path/mod.ts";

export default async function (config) {
  const ENV_ROOT = dirname(fromFileUrl(import.meta.url));
  const env = await load({ envPath: join(ENV_ROOT, "..", ".env") });

  const ROOT_DIR = Deno.cwd();

  config.env = {
    ...(config?.env || {}),
    get: (key) => config.env[key],
    DENO_ENV: "development",
    VIVA_ROLE: Deno.env.get("VIVA_ROLE"),
    VIVA_MODULES_DIR: `${ROOT_DIR}/modules`,
    DAEMON_URL: env.DAEMON_URL,
    CLIENTS_USER_URL: env.CLIENTS_USER_URL,
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
    QUEUE_THRESHOLD: 2,
    CACHE_AGE_SECONDS: 1,
  };

  if (Deno.env.get("VIVA_ROLE") === "daemon") {
    config.env = {
      ...config.env,
      PROVISION_THRESHOLD: 2,
      DAEMON_PORT: env.DAEMON_PORT,

      VIVA_PACKAGES_DIR: `${ROOT_DIR}/packages`,
      VIVA_RUNTIMES_DIR: `${ROOT_DIR}/runtimes`,

      SUPABASE_SERVICE_KEY: env.SUPABASE_SERVICE_KEY,
      DATABASE_URL: env.DATABASE_URL,
      SERVICE_NLP_URL: env.SERVICE_NLP_URL,
      SERVICE_NLP_KEY: env.SERVICE_NLP_KEY,
      OPENAI_API_KEY: env.OPENAI_API_KEY,
      PERPLEXITY_API_KEY: env.PERPLEXITY_API_KEY,
      ANYSCALE_API_KEY: env.ANYSCALE_API_KEY,
      GROQ_API_KEY: env.GROQ_API_KEY,
      ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,
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
      DATABASE_URL: env.DATABASE_URL,
      SCHEMA_ROOT_DIR: `${ROOT_DIR}/packages/schema`,
    };
  }

  for (const [key, value] of Object.entries(config.env)) {
    Deno.env.set(key, value);
  }

  config.isDev = config.env.DENO_ENV === "development";
  config.isProd = config.env.DENO_ENV === "production";
  return config;
}
