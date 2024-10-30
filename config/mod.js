import env from "./env.js";
import services from "./services.js";

const config = {};

let initialized = false;
if (!initialized) {
  await [
    //
    env,
    services,
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(config));
  initialized = true;
}

export default config;
