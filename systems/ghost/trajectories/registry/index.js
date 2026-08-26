import paladin from "@vivalence/paladin";
import { resolve } from "@std/path";
import { v, Vector } from "@vivalence/typology";
import { path } from "../../belt/index.js";
import { bootstrap } from "./bootstrap.js";

export const registry = new Vector();

registry.open(
  {
    nature: "/tap",
    valence: "tap a package — record a reference; a remote source clones into the store (or target)",
    schema: v.object({
      source: v.string().desc("path or git url").optional(),
      target: v.string().desc("clone destination for a remote source").optional(),
    }),
  },
  async (ctx) => {
    let [source, target] = ctx.signal.params ?? [];
    if (!source) throw new Error("usage: viva registry tap <path | git url> [target]");
    source = path.source(source);
    if (target) target = resolve(path.cwd(), target);
    const reference = await paladin.vip.tap(source, target);
    ctx.effect = {
      reference,
      root: paladin.ledger.registry.resolve(reference).absolute,
      record: await paladin.ledger.registry.list(),
    };
  },
);

registry.open(
  {
    nature: "/untap",
    valence: "untap a package — record removal only, the store keeps the working copy",
    schema: v.object({ reference: v.string().desc("recorded reference").optional() }),
  },
  async (ctx) => {
    const reference = ctx.signal.params?.[0];
    if (!reference) throw new Error("usage: viva registry untap <reference>");
    ctx.effect = { record: await paladin.vip.untap(reference) };
  },
);

registry.open(
  {
    nature: "/bootstrap",
    valence:
      "bootstrap a package — a bare manifest, or a clone of another package renamed to the destination; the result is tapped",
    schema: v.object({
      destination: v.string().desc("where the package lands").optional(),
      source: v.string().desc("slug | @owner/package/slug — preset for the picker").optional(),
    }),
  },
  bootstrap,
);
