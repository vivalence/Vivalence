export * from "./prototype.js";
export * from "./lifecycle/index.js";

import { Paladin } from "./prototype.js";
import { populate, resolve, integrate } from "./lifecycle/index.js";

export const paladin = await (async () => {
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

export default paladin;

export const ikiro = (async () => {
  await resolve.variant(paladin);
  await resolve.service(paladin);
  await resolve.runtimes(paladin);

  await integrate.publish(paladin);
  await integrate.secure(paladin);
  // await integrate.mount(paladin);
  await integrate.validate(paladin);
})();

// export * from "./prototype.js";
// export * from "./lifecycle/index.js";

// import { Paladin } from "./prototype.js";
// import { populate, resolve, integrate } from "./lifecycle/index.js";

// export const paladin = await (async () => {
//   const paladin = new Paladin();

//   await populate.env(paladin);
//   await populate.environment(paladin);
//   await populate.system(paladin);
//   await populate.vip(paladin);
//   await populate.modeselector(paladin);
//   await populate.statements(paladin);
//   await populate.questions(paladin);

//   await resolve.variant(paladin);
//   await resolve.service(paladin);
//   await resolve.runtimes(paladin);

//   await integrate.publish(paladin);
//   await integrate.secure(paladin);
//   await integrate.mount(paladin);
//   await integrate.validate(paladin);

//   return paladin;
// })();

// export default paladin;
