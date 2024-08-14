import { load } from "$std/dotenv/mod.ts";
import { dirname, fromFileUrl, join } from "$std/path/mod.ts";

const config = { env: { get: (key) => config.env[key] } };

let initialized = false;
if (!initialized) {
  const env = await load({ envPath: join(dirname(fromFileUrl(import.meta.url)), ".env") });
  const ROOT_DIR = Deno.cwd();

  config.env = {
    ...config.env,
    DENO_ENV: "development",
    DAEMON_URL: env.DAEMON_URL,
    CLIENTS_USER_URL: env.CLIENTS_USER_URL,
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
    PROVISION_THRESHOLD: 5,
    CACHE_AGE_SECONDS: 1,
  };

  if (Deno.env.get("DENO_ROLE") === "daemon") {
    config.env = {
      ...config.env,
      VIVA_MODULES_DIR: `${ROOT_DIR}/viva_modules`,
      VIVA_RUNTIMES_DIR: `${ROOT_DIR}/runtimes`,
      DAEMON_PORT: env.DAEMON_PORT,
      PRIVATE_SUPABASE_ADMIN_KEY: env.PRIVATE_SUPABASE_ADMIN_KEY,
      PRIVATE_DATABASE_URL: env.PRIVATE_DATABASE_URL,
      PRIVATE_SERVICE_NLP_URL: env.PRIVATE_SERVICE_NLP_URL,
      PRIVATE_SERVICE_NLP_KEY: env.PRIVATE_SERVICE_NLP_KEY,
      PRIVATE_OPENAI_API_KEY: env.PRIVATE_OPENAI_API_KEY,
      PRIVATE_PERPLEXITY_API_KEY: env.PRIVATE_PERPLEXITY_API_KEY,
      PRIVATE_ANYSCALE_API_KEY: env.PRIVATE_ANYSCALE_API_KEY,
      PRIVATE_GROQ_API_KEY: env.PRIVATE_GROQ_API_KEY,
      PRIVATE_ANTHROPIC_API_KEY: env.PRIVATE_ANTHROPIC_API_KEY,
    };
  }
  if (Deno.env.get("DENO_ROLE") === "client") {
    config.env = {
      ...config.env,
      ...Object.entries(config.env).reduce((acc, [key, value]) => {
        return (acc[`PUBLIC_${key}`] = value.toString()), acc;
      }, {}),
    };
  }
  if (Deno.env.get("DENO_ROLE") === "sudo") {
    config.env = {
      ...env,
      ...config.env,
      DATABASE_URL: env.PRIVATE_DATABASE_URL,
      PRISMA_DIR: `${ROOT_DIR}/packages/database/prisma`,
    };
  }

  for (const [key, value] of Object.entries(config.env)) {
    Deno.env.set(key, value);
  }

  config.isDev = config.env.DENO_ENV === "development";
  config.isProd = config.env.DENO_ENV === "production";
  initialized = true;
}

export default config;
