import { Paladin } from "@vivalence/paladin/typology";
import { populate, resolve, integrate } from "@vivalence/paladin/typology";

console.json = (obj) => console.log(JSON.stringify(obj, null, 2));

const paladin = await (async function incarne() {
  const paladin = new Paladin();

  await populate.env(paladin);
  await populate.scopes(paladin);

  await populate.environment(paladin);
  await populate.veryimportantpackage(paladin);
  await populate.questions(paladin);

  return paladin;
})();

paladin.ikiro = (async function ikiro() {
  await resolve.circuitry(paladin);
  await resolve.variant(paladin);
  // await resolve.consumables(paladin);
  // await integrate.publish(paladin);
  // await integrate.secure(paladin);
  // await integrate.validate(paladin);
  // await integrate.mountpoint(paladin);
  await integrate.statements(paladin);
  await integrate.publish(paladin);
  await integrate.questions(paladin);
})();

export default paladin;
