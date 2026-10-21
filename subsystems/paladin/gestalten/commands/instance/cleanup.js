import { v, Vector } from "@vivalence/typology";
import paladin from "../../../mod.js";
import { factory as mount } from "../../../instance/factory.js";
import { instance } from "../belt/index.js";
import * as views from "../views/index.js";

export const sweep = async (ctx, roots, scope) => {
  const bundlers = (await Promise.all(roots.map((root) => paladin.bundler.under(root)))).flat();
  const plan = await Promise.all(bundlers.map((bundler) => bundler.prune({ dry: true })));
  const files = plan.reduce((sum, held) => sum + held.removed.length, 0);
  const bytes = plan.reduce((sum, held) => sum + held.bytes, 0);
  const tally = { roots, files, bytes };
  if (!files) return tally;

  if (ctx.signal.flags.force !== true) {
    if (!ctx.hold) throw new Error(`${scope}/cleanup: needs a terminal to confirm, or --force`);
    const label = `remove ${files} stale view bundles (${(bytes / 1e6).toFixed(0)} MB) under ${roots.join(", ")}?`;
    const answer = await ctx.hold(views.confirm, { label, initial: false });
    if (!answer.yes) return { aborted: true, ...tally };
  }

  const pruned = await Promise.all(bundlers.map((bundler) => bundler.prune()));
  return { ...tally, bundles: pruned.filter((held) => held.removed.length) };
};

async function effect(ctx) {
  const [target] = ctx.signal.body;
  if (target) {
    const found = await instance.locate(ctx, target);
    if (!found.mount) return found;
    paladin.env.set("VIVA_INSTANCE_MOUNT", found.mount, "flag");
  }
  await mount(paladin.instance);
  return sweep(ctx, [paladin.scope.mountpoint.absolute], "instance");
}

export const cleanup = new Vector().open(
  {
    nature: "/instance/cleanup",
    valence: "prune stale view bundles under the instance's mountpoint — per mode the newest compiled view and every generated page stay; asks unless --force. Example: viva instance/cleanup chess --force",
    input: v.object({
      target: v.string().desc("slug or path, defaults to the mounted instance. Example: chess").optional(),
      force: v.boolean().desc("skip the confirmation").group("flags").optional(),
    }),
  },
  effect,
);
