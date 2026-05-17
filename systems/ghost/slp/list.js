import paladin from "@vivalence/paladin"
import fs from "@std/fs"
import { join } from "@std/path"

export function list(trajectory) {
  trajectory.open("/list", async () => {
    if (!paladin.scope.variant) {
      throw new Error("no variant scope. set VIVA_VARIANT_MOUNT.")
    }

    const variantDir = paladin.scope.variant.absolute

    if (!(await fs.pathExists(variantDir))) {
      return { variant: variantDir, installed: [] }
    }

    const installed = []
    for await (const entry of Deno.readDir(variantDir)) {
      if (!entry.isFile) continue
      if (!entry.name.endsWith(".viva.js")) continue

      const path = join(variantDir, entry.name)
      const name = entry.name.replace(/\.viva\.js$/, "")

      let type = "unknown"
      let slug = name
      try {
        const mod = await import(`file://${path}`)
        type = mod.manifest?.type ?? "unknown"
        slug = mod.manifest?.slug ?? name
      } catch {}

      installed.push({ name, type, slug, path })
    }

    return { variant: variantDir, installed }
  })
}
