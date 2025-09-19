import * as construct from "./lifecycle/construct.js";
import * as populate from "./lifecycle/populate.js";
import * as resolve from "./lifecycle/resolve.js";
import * as integrate from "./lifecycle/integrate.js";

import Config from "./config.js";

let config;

async function lifecycle() {
  if (config) return config;
  config = new Config();

  await construct.envloaders(config);
  await construct.repoloader(config);
  await construct.modeselector(config);
  await construct.filesystem(config);
  await construct.checks(config);

  await populate.env(config);
  await populate.variant(config);
  // // await populate.impose(config);

  await resolve.runtimes(config);
  // await resolve.guarantee(config);

  await integrate.publish(config);
  await integrate.validate(config);
  await integrate.secure(config);
}

await lifecycle();

export default config;
