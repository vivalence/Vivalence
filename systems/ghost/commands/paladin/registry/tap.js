import paladin from "@vivalence/paladin";
import { resolve } from "@std/path";
import { v, Vector } from "@vivalence/typology";
import { path } from "../../../gestalten/belt/index.js";

export const tap = new Vector().open(
  {
    nature: "/registry/tap",
    valence: "tap a package — record owner → slug, mount; a remote source clones into the store (or target) and is recorded. Example: viva registry/tap git@github.com:vivalence/chess.git",
    schema: v.object({
      source: v.string().desc("path or git url. Example: ../chess"),
      target: v.string().desc("clone destination for a remote source. Example: ~/.viva/registry/chess").optional(),
    }),
  },
  async (ctx) => {
    let [source, target] = ctx.signal.body;
    if (!source) throw new Error("usage: viva registry/tap <path | git url> [target]");
    source = path.source(source);
    if (target) target = resolve(path.cwd(), target);
    const owner = await paladin.ledger.registry.tap(source, target);
    const record = await paladin.ledger.registry.tapped();
    return { owner, root: paladin.ledger.registry.resolve(record[owner].mount).absolute, record };
  },
);
