import { resolveVariant } from "../../lib/variant.js"
import {
  dropProcesses,
  findProcesses,
  isAlive,
  pickProcessTargets,
  readPidFile,
} from "../../lib/processes.js"

export function stop(instance) {
  instance.open("/stop", async (ctx) => {
    const [slugOrPath, target] = ctx.argv

    const resolved = await resolveVariant(slugOrPath)
    const variantPath = resolved.path

    const allProcesses = await findProcesses(variantPath)
    const targets = pickProcessTargets(allProcesses, target)

    if (targets.length === 0) {
      if (!target) {
        const fallbackPid = await readPidFile(variantPath)
        if (fallbackPid) {
          targets.push({ kind: "runtime", slug: "runtime", pid: fallbackPid, variant: variantPath })
        }
      }
    }

    if (targets.length === 0) {
      throw new Error(
        `no recorded process for variant: ${variantPath}${target ? ` (target: ${target})` : ""}`,
      )
    }

    const stopped = []
    for (const proc of targets) {
      let signaled = false
      if (isAlive(proc.pid)) {
        try {
          Deno.kill(proc.pid, "SIGTERM")
          signaled = true
        } catch (error) {
          stopped.push({ ...proc, status: "ERROR", error: error.message })
          continue
        }
      }
      stopped.push({ ...proc, status: signaled ? "STOPPED" : "ALREADY_DEAD" })
    }

    for (const proc of targets) {
      await dropProcesses(variantPath, proc.slug)
    }

    return {
      variant: variantPath,
      slug: resolved.slug,
      stopped,
    }
  })
}
