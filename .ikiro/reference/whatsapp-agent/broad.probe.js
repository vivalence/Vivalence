import { parse } from "@std/jsonc";
import { join } from "@std/path";
import { shape } from "@vivalence/typology";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";

const RECIPE = join(Deno.env.get("HOME"), ".viva/instances/localhost/instance.viva.jsonc");
const recipe = parse(await Deno.readTextFile(RECIPE));
const named = (mode) => (typeof mode === "string" ? mode : mode.module);
const owners = [
  ["/runtime/runtime", recipe.runtime.modes],
  ...recipe.daemons.map((daemon) => [`/daemon/${daemon.manifest.slug}`, daemon.modes]),
];
const listing = (vector, root) =>
  shape.primer.nodes(vector).map(
    (node) => `${root}/${node.nature}${node.valence ? ` — ${node.valence}` : ""}`,
  );
for (const [owner, modes] of owners) {
  const held = { tools: [], primers: [] };
  for (const mode of modes) {
    const module = await accio(named(mode));
    const root = `${owner}/mode/${module.manifest.type}/${module.manifest.slug}`;
    if (module.tools) held.tools.push(...listing(module.tools, root));
    if (module.tools) {
      const listed = listing(module.tools, root);
      console.log(root, listed.length, listed.join("\n").length);
    }
    if (module.primer) held.primers.push(...listing(module.primer, root));
  }
  console.log(
    owner,
    "tools",
    held.tools.length,
    held.tools.join("\n").length,
    "primers",
    held.primers.length,
    held.primers.join("\n").length,
  );
}
