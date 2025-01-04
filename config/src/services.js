export default function (config) {
  config.services = {
    ...config.services,
    nlp: "@vivalence/service/nlp-stanza",
    database: "@vivalence/service/pglite",
    identity: "@vivalence/service/identity",

    // DEPRACATED
    // supabase: "@vivalence/service/supabase",
    // db: "@vivalence/service/db",
  };

  return config;
}
