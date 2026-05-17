import paladin from "@vivalence/paladin"
import fs from "@std/fs"
import { join } from "@std/path"
import { resolveVariant } from "../../lib/variant.js"

export function init(instance) {
  instance.open("/init", async (ctx) => {
    const [slugOrPath, destinationArg] = ctx.argv

    if (!slugOrPath) {
      throw new Error("usage: viva instance init <slug|path> [destination]")
    }

    const destination = destinationArg ?? paladin.scope.variant?.absolute
    if (!destination) {
      throw new Error("no destination. set VIVA_VARIANT_MOUNT or pass [destination]")
    }

    const source = await resolveVariant(slugOrPath)

    const existingMarker = await findVariantMarker(destination)

    if (existingMarker && !ctx.flags.force) {
      throw new Error(
        `destination already contains a variant marker: ${existingMarker} (use --force to wipe)`,
      )
    }

    if (existingMarker && ctx.flags.force) {
      await fs.emptyDir(destination)
    }

    await fs.ensureDir(destination)
    await fs.copy(source.path, destination, { overwrite: true })

    const files = await listFiles(destination)

    return {
      status: "INSTALLED",
      type: "variant",
      slug: source.slug,
      source: source.path,
      destination,
      files,
    }
  })
}

async function findVariantMarker(dir) {
  if (!(await fs.pathExists(dir))) return null
  for await (const entry of Deno.readDir(dir)) {
    if (entry.isDirectory) {
      if (entry.name === "bak") continue
      const nested = await findVariantMarker(join(dir, entry.name))
      if (nested) return nested
      continue
    }
    if (!entry.name.endsWith(".viva.js")) continue
    const path = join(dir, entry.name)
    try {
      const mod = await import(`file://${path}`)
      if (mod.manifest?.type === "variant") return path
    } catch {}
  }
  return null
}

async function listFiles(dir, prefix = "") {
  const out = []
  for await (const entry of Deno.readDir(dir)) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory) {
      const nested = await listFiles(join(dir, entry.name), name)
      out.push(...nested)
      continue
    }
    out.push(name)
  }
  return out.sort()
}
