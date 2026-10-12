import paladin, { lifecycle } from "@vivalence/paladin";
import { BufferControl, Confirm } from "@vivalence/sheets";
import { locate } from "./target.js";

export const sweep = async (ctx, roots, scope) => {
  const bundlers = (await Promise.all(roots.map((root) => paladin.bundler.under(root)))).flat();
  const plan = await Promise.all(bundlers.map((bundler) => bundler.prune({ dry: true })));
  const files = plan.reduce((sum, held) => sum + held.removed.length, 0);
  const bytes = plan.reduce((sum, held) => sum + held.bytes, 0);
  const tally = { roots, files, bytes };
  if (!files) return tally;

  if (ctx.signal.flags?.force !== true) {
    if (!ctx.interactive) throw new Error(`${scope}/cleanup: needs a terminal to confirm, or --force`);
    const buffer = new BufferControl();
    const label = `remove ${files} stale view bundles (${(bytes / 1e6).toFixed(0)} MB) under ${roots.join(", ")}?`;
    const choice = await ctx.view.scroll.render(
      { label, defaultChoice: false, onSubmit: (value) => buffer.release(value) },
      buffer,
      Confirm,
    );
    if (!choice) return { aborted: true, ...tally };
  }

  const pruned = await Promise.all(bundlers.map((bundler) => bundler.prune()));
  return { ...tally, bundles: pruned.filter((held) => held.removed.length) };
};

export async function cleanup(ctx) {
  const [target] = ctx.signal.params ?? [];
  if (target) {
    const found = await locate(ctx, target);
    if (!found.mount) return (ctx.effect = found);
    paladin.env.set("VIVA_INSTANCE_MOUNT", found.mount, "flag");
  }
  await lifecycle.mount(paladin.instance);
  ctx.effect = await sweep(ctx, [paladin.scope.mountpoint.absolute], "instance");
}
