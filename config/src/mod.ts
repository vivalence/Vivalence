import env from "./env.js";
import identity from "./identity.js";
import services from "./services.js";

const config: Config = { services: {}, env: {} };

let initialized = false;
if (!initialized) {
  await [
    //
    identity,
    services,
    env,
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(config));
  initialized = true;
}

export default config;
