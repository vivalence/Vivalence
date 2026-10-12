import paladin from "@vivalence/paladin";
import { v, Vector } from "@vivalence/typology";
import { sweep } from "../instance/cleanup.js";

export const cleanup = new Vector().open(
  {
    nature: "/ledger/cleanup",
    valence: "prune stale view bundles across every recorded instance — instance/cleanup over the whole ledger, one confirmation; asks unless --force. Example: viva ledger/cleanup --force",
    schema: v.object({ force: v.boolean().desc("skip the confirmation").group("flags").optional() }),
  },
  async (ctx) => {
    const record = await paladin.ledger.instances.list();
    const mounts = await Promise.all(record.map(async ({ mount }) => (mount && (await Deno.stat(mount).catch(() => null)) ? [mount] : [])));
    return sweep(ctx, mounts.flat(), "ledger");
  },
);
