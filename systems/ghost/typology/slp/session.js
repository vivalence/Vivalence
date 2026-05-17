import { join } from "node:path";
import { homedir } from "node:os";

const SESSION_PATH = join(homedir(), ".viva", "session.json");

let cache = null

function load() {
  if (cache) return cache
  try {
    cache = JSON.parse(Deno.readTextFileSync(SESSION_PATH))
  } catch {
    cache = {}
  }
  return cache
}

function save(data) {
  cache = data
  const dir = join(homedir(), ".viva")
  try { Deno.mkdirSync(dir, { recursive: true }) } catch {}
  Deno.writeTextFileSync(SESSION_PATH, JSON.stringify(data, null, 2))
}

export const $authority = {
  get() { return load().authority || null },
  set(authority) { save({ ...load(), authority }) },
}

export const $identity = {
  get() { return load().identity || null },
  set(identity) { save({ ...load(), identity }) },
}

export function persist(authority, identity) {
  save({ ...load(), authority, identity })
}

export function clear() {
  save({})
}

export function read() {
  return load()
}
