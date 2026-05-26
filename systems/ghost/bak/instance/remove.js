import paladin from "@vivalence/paladin";
import fs from "@std/fs";
import { join } from "@std/path";

export function remove(instance) {
  instance.open("/remove", async (ctx) => {
    const [name] = ctx.argv;

    if (!name) throw new Error("usage: viva instance remove <name>");

    if (!paladin.scope.variant) {
      throw new Error("no variant scope. set VIVA_VARIANT_MOUNT.");
    }

    const filename = name.endsWith(".viva.js") ? name : `${name}.viva.js`;
    const path = join(paladin.scope.variant.absolute, filename);

    if (!(await fs.pathExists(path))) {
      throw new Error(`not installed: ${name} (looked at ${path})`);
    }

    await Deno.remove(path);

    return { status: "REMOVED", name, path };
  });
}
