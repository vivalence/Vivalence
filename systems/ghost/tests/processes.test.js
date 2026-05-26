import { assertEquals } from "@std/assert"
import { pickProcessTargets } from "../lib/processes.js"

const variant = "/tmp/fixture-variant"

const processes = [
  { kind: "runtime", slug: "runtime", pid: 1, variant },
  { kind: "client", slug: "kajuit", pid: 2, variant },
  { kind: "client", slug: "ghost", pid: 3, variant },
]

Deno.test("pickProcessTargets: no target → all", () => {
  assertEquals(pickProcessTargets(processes).length, 3)
})

Deno.test("pickProcessTargets: 'runtime' → runtime kind only", () => {
  const result = pickProcessTargets(processes, "runtime")
  assertEquals(result.length, 1)
  assertEquals(result[0].kind, "runtime")
})

Deno.test("pickProcessTargets: 'client' → all client kind", () => {
  const result = pickProcessTargets(processes, "client")
  assertEquals(result.length, 2)
  assertEquals(result.map((p) => p.slug).sort(), ["ghost", "kajuit"])
})

Deno.test("pickProcessTargets: 'clients' → all client kind", () => {
  assertEquals(pickProcessTargets(processes, "clients").length, 2)
})

Deno.test("pickProcessTargets: slug match", () => {
  const result = pickProcessTargets(processes, "kajuit")
  assertEquals(result.length, 1)
  assertEquals(result[0].slug, "kajuit")
})

Deno.test("pickProcessTargets: slug match for runtime by slug", () => {
  const result = pickProcessTargets(processes, "runtime")
  assertEquals(result.length, 1)
})

Deno.test("pickProcessTargets: unknown slug → empty", () => {
  assertEquals(pickProcessTargets(processes, "doesnotexist"), [])
})

Deno.test("pickProcessTargets: empty input array", () => {
  assertEquals(pickProcessTargets([], "runtime"), [])
})
