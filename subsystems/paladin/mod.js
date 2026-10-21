import { Paladin } from "./paladin/prototype.js";
import * as lifecycle from "./paladin/lifecycle.js";
import * as tools from "./gestalten/tools/index.js";
import { commands } from "./gestalten/commands/index.js";
import { FULL } from "./gestalten/belt/index.js";

const paladin = new Paladin();
paladin.tools = tools;
paladin.commands = commands;
lifecycle.belt(paladin, FULL);
await lifecycle.env(paladin);
await lifecycle.scopes(paladin);
lifecycle.instance(paladin);

if (paladin.is.citizen) {
  await lifecycle.statements(paladin);
}

export default paladin;
export { factories, lifecycle } from "./typology.js";
