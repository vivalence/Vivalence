import { dirname, fromFileUrl, join } from "$std/path/mod.ts";

export default async function (config) {
  config.services = {
    supabase: "@vivalence/service/supabase",
    // llm: "@vivalence/service/llm-litellm",
    nlp: "@vivalence/service/nlp-stanza",
  };

  return config;
}
