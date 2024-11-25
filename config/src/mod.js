import identity from "./identity.js";
import env from "./env.js";
import services from "./services.js";

const config = { services: {}, env: {} };

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
