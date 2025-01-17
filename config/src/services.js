export default function (config) {
  config.services = {
    ...config.services,

    database: {
      service: "@vivalence/service/libsql",
      config: {
        filePath: config.env.get("VIVA_DATABASE_PATH"),
      },
    },
    identity: { service: "@vivalence/service/identity", config: { env: {} } },

    // nlp: "@vivalence/service/nlp-stanza",
    // DEPRACATED
    // supabase: "@vivalence/service/supabase",
    // db: "@vivalence/service/db",
  };

  return config;
}
