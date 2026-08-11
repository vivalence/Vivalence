import paladin from "@vivalence/paladin";
import { join } from "@std/path";
import { Path } from "@vivalence/typology";
import { config } from "../../belt/index.js";
import { Init } from "./Init.jsx";

export async function init(ctx) {
  const home = join(Deno.env.get("HOME"), ".viva");

  const exportLineFor = (mount) => `export VIVA_LEDGER_MOUNT="${mount}"`;
  const persist = (mount) => config.writeShellConfig("VIVA_LEDGER_MOUNT", mount);

  const choice = await ctx.view.scroll.render({ home, persist, exportLineFor }, null, Init);
  if (!choice || choice.aborted) return (ctx.effect = { aborted: true });

  // pin paladin.scope.ledger to chosen dir
  const root = new Path(choice.mount);
  paladin.scopes([["ledger", () => true, () => root]]);

  // scaffold system layout :: logs (jsonl spans + stdout/err) + locks (<instance>_<process>.lock)
  const SCAFFOLD = ["logs", "locks"];
  for (const sub of SCAFFOLD) {
    const path = root.branch(sub).absolute;
    await Deno.mkdir(path, { recursive: true });
  }

  // future :: integrity validation lives here. for now: scope-presence probe.
  const checks = {
    repository: !!paladin.scope.repository,
    registry: !!paladin.scope.registry,
  };

  // console.log({ choice, root, checks });
  ctx.effect = { ...choice, scaffolded: SCAFFOLD, checks };
}
