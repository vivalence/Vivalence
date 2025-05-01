// import Repository from "@vivalence/repository";

export default async function (config) {
  config.services = {
    ...config.services,
    database: {
      service: "@vivalence/service/libsql",
      config: {
        filePath: config.env.get("VIVA_DATABASE_PATH"),
      },
    },
    identity: { service: "@vivalence/service/identity", config: { mode: "SINGLEPLAYER", env: {} } },
  };
  // config.services = await Repository.services.load({...config.services, database: {service: "@vivalence/service/libsql", config: {filePath: config.env.get("VIVA_DATABASE_PATH"),},}, identity: { service: "@vivalence/service/identity", config: { mode: "SINGLEPLAYER", env: {} } },});

  return config;
}
