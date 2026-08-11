import { Paladin } from "./prototypes/paladin.js";
import * as populate from "./lifecycle/populate.js";
import * as integrate from "./lifecycle/integrate.js";
import * as skills from "./skills/index.js";

const paladin = new Paladin();
paladin.skills = skills;
await populate.env(paladin);
await populate.scopes(paladin);

if (paladin.is.citizen) {
  await integrate.statements(paladin);
}

export default paladin;
