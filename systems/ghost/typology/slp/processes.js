import fs from "@std/fs"
import { dirname, join } from "@std/path"

const HOME = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "/tmp"
const INDEX_PATH = join(HOME, ".viva", "processes.json")

export async function readIndex() {
  try {
    const text = await Deno.readTextFile(INDEX_PATH)
    return JSON.parse(text)
  } catch {
    return { processes: [] }
  }
}

export async function writeIndex(index) {
  await fs.ensureDir(dirname(INDEX_PATH))
  await Deno.writeTextFile(INDEX_PATH, JSON.stringify(index, null, 2))
}

export async function recordProcess(entry) {
  const index = await readIndex()
  index.processes = index.processes.filter(
    (p) => !(p.variant === entry.variant && p.slug === entry.slug),
  )
  index.processes.push(entry)
  await writeIndex(index)

  if (entry.kind === "runtime") {
    const pidFile = join(entry.variant, "runtime.pid")
    await Deno.writeTextFile(pidFile, String(entry.pid))
  }
}

export async function findProcesses(variantPath, slug) {
  const index = await readIndex()
  return index.processes.filter((p) => {
    if (p.variant !== variantPath) return false
    if (slug !== undefined && p.slug !== slug) return false
    return true
  })
}

export async function dropProcesses(variantPath, slug) {
  const index = await readIndex()
  index.processes = index.processes.filter((p) => {
    if (p.variant !== variantPath) return true
    if (slug !== undefined && p.slug !== slug) return true
    return false
  })
  await writeIndex(index)

  if (slug === undefined || slug === "runtime") {
    const pidFile = join(variantPath, "runtime.pid")
    try {
      await Deno.remove(pidFile)
    } catch {}
  }
}

export async function readPidFile(variantPath) {
  const pidFile = join(variantPath, "runtime.pid")
  try {
    const text = await Deno.readTextFile(pidFile)
    return Number(text.trim())
  } catch {
    return null
  }
}

export function isAlive(pid) {
  try {
    Deno.kill(pid, "SIGCONT")
    return true
  } catch {
    return false
  }
}

export function pickProcessTargets(processes, target) {
  if (!target) return processes
  if (target === "runtime") return processes.filter((p) => p.kind === "runtime")
  if (target === "client" || target === "clients") {
    return processes.filter((p) => p.kind === "client")
  }
  return processes.filter((p) => p.slug === target)
}
