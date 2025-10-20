// const start = Math.round(performance.now(), 5);
// const tick = () => Math.round(performance.now(), 5) - start;
// const ticker = (name) => console.log(`[TICK] [${tick() / 1000}s] [${name}]`);

export * from "./prototype.js";
export * from "./lifecycle/index.js";

import { Paladin } from "./prototype.js";
import { populate, resolve, integrate } from "./lifecycle/index.js";

const paladin = await (async () => {
  const paladin = new Paladin();

  await populate.env(paladin);
  await populate.environment(paladin);
  await populate.system(paladin);
  await populate.vip(paladin);
  await populate.modeselector(paladin);
  await populate.statements(paladin);
  await populate.questions(paladin);

  return paladin;
})();

paladin.ikiro = (async () => {
  await resolve.variant(paladin);
  await resolve.runtimes(paladin);

  await integrate.publish(paladin);
  await integrate.secure(paladin);
  await integrate.validate(paladin);
})();

export default paladin;
