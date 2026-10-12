import { Paladin } from "./paladin/prototype.js";
import * as lifecycle from "./paladin/lifecycle.js";
import * as tools from "./gestalten/tools/index.js";

const paladin = new Paladin();
paladin.tools = tools;
await lifecycle.env(paladin);
await lifecycle.scopes(paladin);
lifecycle.instance(paladin);

if (paladin.is.citizen) {
  await lifecycle.statements(paladin);
}

export default paladin;
export { factories, lifecycle } from "./typology.js";
