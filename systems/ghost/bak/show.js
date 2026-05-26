import paladin from "@vivalence/paladin"
import fs from "@std/fs"
import { join } from "@std/path"

export function show(trajectory) {
  trajectory.open("/show", async (ctx) => {
    const [name] = ctx.argv

    if (!name) throw new Error("usage: viva show <name>")

    if (!paladin.scope.variant) {
      throw new Error("no variant scope. set VIVA_VARIANT_MOUNT.")
    }

    const filename = name.endsWith(".viva.js") ? name : `${name}.viva.js`
    const path = join(paladin.scope.variant.absolute, filename)

    if (!(await fs.pathExists(path))) {
      throw new Error(`not installed: ${name} (looked at ${path})`)
    }

    let manifest = null
    let exports = []
    try {
      const mod = await import(`file://${path}`)
      manifest = mod.manifest ?? null
      exports = Object.keys(mod)
    } catch (error) {
      throw new Error(`failed to load ${path}: ${error.message}`)
    }

    return { name, path, manifest, exports }
  })
}
