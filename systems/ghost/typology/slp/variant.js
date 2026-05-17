import paladin from "@vivalence/paladin"
import fs from "@std/fs"
import { dirname, isAbsolute, resolve } from "@std/path"

export async function resolveVariant(arg) {
  if (!arg) throw new Error("variant required")

  if (isPathLike(arg)) {
    const absolute = isAbsolute(arg) ? arg : resolve(arg)
    if (!(await fs.pathExists(absolute))) {
      throw new Error(`variant path not found: ${absolute}`)
    }
    return { path: absolute, source: "path", slug: null }
  }

  if (!paladin.vip) {
    throw new Error("paladin.vip not available; cannot resolve variant slug")
  }

  const cake = await paladin.vip.accio({
    owner: "@vivalence",
    type: "variant",
    slug: arg,
  })

  if (!cake?.mount?.absolute) {
    throw new Error(`variant manifest has no mount: ${arg}`)
  }

  return {
    path: dirname(cake.mount.absolute),
    source: "slug",
    slug: arg,
    manifest: cake.manifest,
  }
}

function isPathLike(arg) {
  return arg.startsWith("/") || arg.startsWith("./") || arg.startsWith("../") || arg === "." || arg === ".."
}
