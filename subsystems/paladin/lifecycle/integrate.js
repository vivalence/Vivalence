export async function publish(config) {
  const publish = [
    "VIVA_GAIA_SERVE",
    "VIVA_DAEMON_SERVE",
    "VIVA_CLIENT_HTML_SERVE",
  ];

  for (const key of publish) {
    const value = config.env.get(key);
    if (!value) continue;
    config.env.set(`PUBLIC_${key}`, value);
    Deno.env.set(`PUBLIC_${key}`, value.toString());
  }
}

export async function secure(config) {
  delete config.secret;
}

export async function validate(config) {
  const requiredEnvVars = [
    //
  ];

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
//   //     "VIVA_REPOSITORY_MOUNT",
//   //     "VIVA_REGISTER_MOUNT",
//   //     "VIVA_USER_MOUNT",
//   //   ].map((key) => {
//   //   });
//   //   [
//   //     "VIVA_REPOSITORY_MOUNT",
//   //     "VIVA_REGISTER_MOUNT",
//   //     "VIVA_USER_MOUNT", //
//   //     "VIVA_DATA_MOUNT", //
//   //     "VIVA_CONFIG_MOUNT", //
//   //     // "VIVA_MODULES_MOUNT", //
//   //     // "VIVA_SERVICES_MOUNT", //
//   //   ].map((key) => {
//   //   });
//   //   //  ensure dir per service!
//   //   //  v/data/services/[r_eng2lat_datamap, r_eng2lat_nlp, d_datamap]
//   //   return config;
// }
