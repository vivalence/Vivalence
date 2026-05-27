import paladin from "@vivalence/paladin";
import { join } from "@std/path";
import { Path } from "@vivalence/typology";
import { Init } from "./Init.jsx";

export async function init(ctx) {
  const home = join(Deno.env.get("HOME"), ".viva");

  const exportLineFor = (mount) => `export VIVA_SYSTEM_MOUNT="${mount}"`;
  const persist = (mount) => writeShellConfig("VIVA_SYSTEM_MOUNT", mount);

  const choice = await ctx.view.scroll.render({ home, persist, exportLineFor }, null, Init);
  if (!choice || choice.aborted) return (ctx.effect = { aborted: true });

  // pin paladin.scope.system to chosen dir
  const root = new Path(choice.mount);
  paladin.scopes([["system", () => true, () => root]]);

  // scaffold system layout :: logs (jsonl spans + stdout/err) + locks (<type>_<slug>.lock)
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

async function writeShellConfig(key, value) {
  const dir = join(
    Deno.env.get("XDG_CONFIG_HOME") ?? join(Deno.env.get("HOME"), ".config"),
    "viva",
  );
  const file = join(dir, "env");
  await Deno.mkdir(dir, { recursive: true });

  const existing = await Deno.readTextFile(file).catch(() => "");
  const lines = existing.split("\n").filter(Boolean);
  const line = `export ${key}="${value}"`;
  const index = lines.findIndex((entry) => entry.startsWith(`export ${key}=`));
  if (index >= 0) lines[index] = line;
  else lines.push(line);

  await Deno.writeTextFile(file, lines.join("\n") + "\n");
  return file;
}
