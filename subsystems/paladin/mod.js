import { Paladin } from "./prototypes/paladin.js";
import * as lifecycle from "./lifecycle/index.js";
import * as skills from "./skills/index.js";

const paladin = new Paladin();
paladin.skills = skills;
await lifecycle.populate.env(paladin);
await lifecycle.populate.scopes(paladin);
lifecycle.populate.instance(paladin);

if (paladin.is.citizen) {
  await lifecycle.integrate.statements(paladin);
}

export default paladin;
export { lifecycle };
