import paladin from "@vivalence/paladin";
import { v, Vector } from "@vivalence/typology";
import { tap } from "./tap.js";

export const instances = new Vector();

instances.open(
  {
    nature: "/count",
    valence: "how many instances the shelf holds",
    schema: v.object({}),
  },
  async (ctx) => {
    ctx.effect = { count: (await paladin.ledger.instances.list()).length };
  },
);

instances.open(
  {
    nature: "/list",
    valence: "every instance on the shelf — slug, mount, valence, and which are running",
    schema: v.object({}),
  },
  async (ctx) => {
    const held = await paladin.ledger.instances.list();
    ctx.effect = { instances: held };
  },
);
