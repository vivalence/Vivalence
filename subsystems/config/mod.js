import * as preflight from "./lifecycle/preflight.js";
import * as populate from "./lifecycle/populate.js";
import * as resolve from "./lifecycle/resolve.js";
import * as integrate from "./lifecycle/integrate.js";

import Config from "./config.js";

let config;

async function lifecycle() {
  if (config) return config;
  config = new Config();

  await preflight.envloaders(config);
  await preflight.repoloader(config);
  await preflight.modeselector(config);
  await preflight.checks(config);

  await populate.env(config);
  await populate.secrets(config);
  await populate.services(config);

  await resolve.daemon(config);
  await resolve.runtimes(config);
  await resolve.clients(config);

  await integrate.publish(config);
  await integrate.validate(config);
  await integrate.secure(config);
}

await lifecycle();

export default config;
