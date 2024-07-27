import { load } from "$std/dotenv/mod.ts";
import { dirname, fromFileUrl, join } from "$std/path/mod.ts";

const config = { env: { get: (key) => config.env[key] } };

let initialized = false;
if (!initialized) {
  const env = await load({ envPath: join(dirname(fromFileUrl(import.meta.url)), ".env") });

  config.env = {
    ...config.env,
    DAEMON_URL: env.DAEMON_URL,
    CLIENTS_USER_URL: env.CLIENTS_USER_URL,
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
    PROVISION_THRESHOLD: 5,
  };

  if (Deno.env.get("DENO_ROLE") === "daemon") {
    config.env = {
      ...config.env,
      VIVA_MODULES_DIR: "/Users/finn/vivalence/code/vivalence/viva_modules",
      VIVA_RUNTIMES_DIR: "/Users/finn/vivalence/code/vivalence/runtimes",
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
    };
  }

  for (const [key, value] of Object.entries(config.env)) {
    Deno.env.set(key, value);
  }

  initialized = true;
}

export default config;
