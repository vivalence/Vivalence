import paladin from "@vivalence/paladin"
import { resolveVariant } from "../../lib/variant.js"
import {
  findProcesses,
  isAlive,
  pickProcessTargets,
  readIndex,
} from "../../lib/processes.js"

export function status(instance) {
  instance.open("/status", async (ctx) => {
    const [slugOrPath, target] = ctx.argv

    if (!slugOrPath) {
      const index = await readIndex()
      return {
        lighthouse: ctx.lighthouseUrl,
        isAgent: ctx.isAgent,
        registry: paladin.scope.registry?.absolute,
        variant: paladin.scope.variant?.absolute,
        processes: index.processes.map((p) => ({ ...p, alive: isAlive(p.pid) })),
      }
    }

    const resolved = await resolveVariant(slugOrPath)
    const variantPath = resolved.path

    const allProcesses = await findProcesses(variantPath)
    const matched = pickProcessTargets(allProcesses, target)

    if (matched.length === 0) {
      return {
        status: "NOT_RUNNING",
        variant: variantPath,
        slug: resolved.slug,
        ...(target ? { target } : {}),
      }
    }

    return {
      variant: variantPath,
      slug: resolved.slug,
      processes: matched.map((p) => ({ ...p, alive: isAlive(p.pid) })),
    }
  })
}
