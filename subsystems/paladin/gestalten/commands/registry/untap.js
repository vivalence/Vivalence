import { v, Vector } from "@vivalence/typology";
import paladin from "../../../mod.js";
import { registry } from "../belt/index.js";

export const untap = new Vector().open(
  {
    nature: "/registry/untap",
    valence: "untap a package — record removal only, the store keeps the working copy. Example: viva registry/untap @chess",
    input: v.object({ package: v.string().desc("owner, slug, identifier or mount. Example: @chess") }),
  },
  async (ctx) => {
    const name = ctx.signal.body[0];
    if (!name) throw new Error("usage: viva registry/untap <owner | slug | mount>");
    const held = await registry.tapped(name);
    if (!held) throw new Error(`registry/untap: no tapped package '${name}' — viva registry/doctor`);
    return { untapped: held.owner, record: await paladin.ledger.registry.untap(held.owner) };
  },
);
