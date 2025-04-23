export default function (config) {
  config.services = {
    ...config.services,

    identity: { service: "@vivalence/service/identity", config: { mode: "SINGLEPLAYER", env: {} } },
    // nlp: "@vivalence/service/nlp-stanza",
    // DEPRACATED
    // supabase: "@vivalence/service/supabase",
    // db: "@vivalence/service/db",
  };

  return config;
}
