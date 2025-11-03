import { Paladin } from "@vivalence/paladin/typology";
import { populate, resolve, integrate } from "@vivalence/paladin/typology";

const paladin = await (async function incarne() {
  const paladin = new Paladin();

  await populate.env(paladin);
  await populate.environment(paladin);
  await populate.modeselector(paladin);
  await populate.scopes(paladin);
  await populate.veryimportantpackage(paladin);
  await populate.statements(paladin);
  await populate.questions(paladin);

  return paladin;
})();

paladin.ikiro = (async function ikiro() {
  await resolve.circuits(paladin);
  await resolve.variant(paladin);
  await resolve.dependencies(paladin);
  await resolve.mounts(paladin);
  // await integrate.publish(paladin);
  // await integrate.secure(paladin);
  // await integrate.validate(paladin);
})();

export default paladin;
