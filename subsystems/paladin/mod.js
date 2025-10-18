import * as populate from "./lifecycle/populate.js";
import * as integrate from "./lifecycle/integrate.js";
// import * as resolve from "./lifecycle/resolve.js";

import { Config } from "./prototype.js";

let config;

async function lifecycle() {
  if (config) return config;
  config = new Config();

  await populate.env(config);
  await populate.environment(config);
  await populate.repository(config);
  await populate.registry(config);
  await populate.modeselector(config);
  await populate.statements(config);
  await populate.questions(config);

  // await populate.variant(config);

  // await populate.env(config);
  // // // await populate.impose(config);

  // await resolve.runtimes(config);
  // // await resolve.guarantee(config);

  // await integrate.publish(config);
  // await integrate.validate(config);
  // await integrate.secure(config);
}

await lifecycle();

export default config;
