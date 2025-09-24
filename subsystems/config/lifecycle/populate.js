import { Env } from "@vivalence/typology/prototypes";

export async function env(config) {
  // system
  config.check.env("VIVA_CONFIG_DIR")?.throw();
  config.env.assign(await config.read.config.env("public.jsonc"));

  // services
  config.env.service = new Env(); //
  const service = await config.read.config.env("services.jsonc");
  config.env.service.assign(service);

  // secrets
  if (["SUDO", "DAEMON"].includes(config.env.get("VIVA_SYSTEM_ROLE"))) {
    config.env.secrets = new Env(); //
    const secrets = await config.read.config.env("secrets.jsonc");
    config.env.secrets.assign(secrets);
  }
}

export async function variant(config) {
  const file = config.joins.config.system("variant.viva.js");
  const mod = await config.read.module(file);
  const { lighthouse, daemon, clients } = await mod(config);

  if (lighthouse) {
    config.lighthouse = lighthouse.config;
    if (typeof config.lighthouse.url !== URL)
      config.lighthouse.url = new URL(config.lighthouse.url);
  }
  if (daemon) {
    // todo: typeof serve === url
    const { serve } = daemon.config;
    config.env.assign({
      VIVA_DAEMON_DOMAIN: serve.domain,
      VIVA_DAEMON_PORT: serve.port,
      VIVA_DAEMON_URL: `http://${serve.domain}:${serve.port}`,
    });

    config.daemon = daemon.config;
    config.daemon.url = new URL(`http://${serve.domain}:${serve.port}`);
  }

  if (clients) {
    for (const [slug, client] of Object.entries(clients)) {
      const { serve } = client.config;

      const envKey = `VIVA_CLIENTS_${slug.toUpperCase()}`;
      const domainKey = `${envKey}_DOMAIN`;
      const portKey = `${envKey}_PORT`;
      const urlKey = `${envKey}_URL`;
      const url = `http://${serve.domain}:${serve.port}`;

      config.env.assign({
        [domainKey]: serve.domain,
        [portKey]: serve.port,
        [urlKey]: url,
      });

      config.clients[slug] = client.config;
    }
  }

  return config;
}
// export async function variant(config) {
//   const file = config.joins.config.system("variant.viva.js");

//   const mod = await config.read.module(file);
//   //
//   const { daemon, clients, remote } = await mod(config);
//   //
//   if (daemon) {
//     // daemon.config.env
//     // daemon.secret.env

//     config.daemon = {
//       env: new Env({
//         //
//       }),
//     };

//     //   VIVA_DAEMON_URL: `http://${daemon.server.domain}:${daemon.server.port}`,
//     //   VIVA_DAEMON_DOMAIN: daemon.server.domain,
//     //   VIVA_DAEMON_PORT: daemon.server.port,

//     // config.env.set({})
//   }

//   //   VIVA_CLIENTS_HTML_URL: `http://${clients.web.domain}:${clients.web.port}`,
//   //   VIVA_CLIENTS_HTML_DOMAIN: clients.web.domain,
//   //   VIVA_CLIENTS_HTML_PORT: clients.web.port,
//   // config.system = system;
//   // config.remote = remote;
//   // console.log(config);
// }
