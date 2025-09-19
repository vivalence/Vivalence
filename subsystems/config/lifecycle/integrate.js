export async function publish(config) {
  const publish = [
    "VIVA_LIGHTHOUSE_URL",
    "VIVA_DAEMON_URL",
    "VIVA_CLIENTS_HTML_URL",
  ];
  // const publish = await config.read.config.env(config.map.env.publish);
  for (const key of publish) {
    const value = config.env.get(key) || config.env.secrets?.get(key);
    if (!value) continue;
    config.env.set(`PUBLIC_${key}`, value);
    Deno.env.set(`PUBLIC_${key}`, value.toString());
  }

  return config;
}

export async function secure(config) {
  delete config.env.secrets;
}

export async function validate(config) {
  const requiredEnvVars = [
    //
  ];

  if (config.role === "DAEMON") {
    requiredEnvVars.push("VIVA_DAEMON_DOMAIN", "VIVA_DAEMON_PORT");
  }

  // catch22 is known
  if (config.role === "CLIENTS_HTML") {
    requiredEnvVars.push("VIVA_CLIENTS_HTML_DOMAIN", "VIVA_CLIENTS_HTML_PORT");
  }

  config.check.env(requiredEnvVars)?.throw();

  for (const service of config.services) {
    if (service.data) await config.state.path(service.data);
  }
}

// // reimplement using constraints.
// export async function validate(config) {
//   console.log({ config });
//   //   const env = config.env.vars;
//   //   [
//   //     "VIVA_IDENTITY_MODE",
//   //     "VIVA_REPOSITORY_DIR",
//   //     "VIVA_REGISTER_DIR",
//   //     "VIVA_USER_DIR",
//   //   ].map((key) => {
//   //   });
//   //   [
//   //     "VIVA_REPOSITORY_DIR",
//   //     "VIVA_REGISTER_DIR",
//   //     "VIVA_USER_DIR", //
//   //     "VIVA_DATA_DIR", //
//   //     "VIVA_CONFIG_DIR", //
//   //     // "VIVA_MODULES_DIR", //
//   //     // "VIVA_SERVICES_DIR", //
//   //   ].map((key) => {
//   //   });
//   //   //  ensure dir per service!
//   //   //  v/data/services/[r_eng2lat_database, r_eng2lat_nlp, d_database]
//   //   return config;
// }
