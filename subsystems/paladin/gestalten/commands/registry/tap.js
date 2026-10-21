import { resolve } from "@std/path";
import { v, Vector } from "@vivalence/typology";
import paladin from "../../../mod.js";
import { path } from "../belt/index.js";

export const tap = new Vector().open(
  {
    nature: "/registry/tap",
    valence: "tap a package — record owner → slug, mount; a remote source clones into the store (or target) and is recorded. Example: viva registry/tap git@github.com:vivalence/chess.git",
    input: v.object({
      source: v.string().desc("path or git url. Example: ../chess"),
      target: v.string().desc("clone destination for a remote source. Example: ~/.viva/registry/chess").optional(),
    }),
  },
  async (ctx) => {
    const [source, target] = ctx.signal.body;
    if (!source) throw new Error("usage: viva registry/tap <path | git url> [target]");
    const owner = await paladin.ledger.registry.tap(path.source(source), target ? resolve(path.cwd(), target) : undefined);
    const record = await paladin.ledger.registry.tapped();
    return { owner, root: paladin.ledger.registry.resolve(record[owner].mount).absolute, record };
  },
);
