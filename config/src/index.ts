import env from "./env.js";
import identity from "./identity.js";
import services from "./services.js";
import repo from "./repo.js";

let initialized = false;
const config = { services: {}, env: {}, repo: { importmap: {} } };

const log = (m) => (c) => {
  // undefined"" { services: {}, env: {}, repo: { importmap: {} } }
  console.log(m, c);
  return c;
};

if (!initialized) {
  await [
    //
    // log(),
    identity,
    env,
    services,
    repo,
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(config));
  initialized = true;
}

export default config;
