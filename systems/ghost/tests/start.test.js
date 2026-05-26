import { assertEquals, assertThrows } from "@std/assert"
import { pickStartPlan } from "../trajectories/instance/start.js"

const wafer = {
  runtime: { slug: "runtime" },
  clients: {
    ghost: { slug: "ghost" },
    kajuit: { slug: "kajuit" },
  },
}

Deno.test("pickStartPlan: no target → runtime + all clients", () => {
  const plan = pickStartPlan(wafer)
  assertEquals(plan.runtime, wafer.runtime)
  assertEquals(plan.clients.map((c) => c.slug).sort(), ["ghost", "kajuit"])
})

Deno.test("pickStartPlan: literal 'runtime' → runtime only", () => {
  const plan = pickStartPlan(wafer, "runtime")
  assertEquals(plan.runtime, wafer.runtime)
  assertEquals(plan.clients, [])
})

Deno.test("pickStartPlan: literal 'client' → all clients", () => {
  const plan = pickStartPlan(wafer, "client")
  assertEquals(plan.runtime, null)
  assertEquals(plan.clients.map((c) => c.slug).sort(), ["ghost", "kajuit"])
})

Deno.test("pickStartPlan: literal 'clients' → all clients", () => {
  const plan = pickStartPlan(wafer, "clients")
  assertEquals(plan.runtime, null)
  assertEquals(plan.clients.length, 2)
})

Deno.test("pickStartPlan: slug match on client → that client only", () => {
  const plan = pickStartPlan(wafer, "kajuit")
  assertEquals(plan.runtime, null)
  assertEquals(plan.clients.length, 1)
  assertEquals(plan.clients[0].slug, "kajuit")
})

Deno.test("pickStartPlan: ghost client by slug", () => {
  const plan = pickStartPlan(wafer, "ghost")
  assertEquals(plan.runtime, null)
  assertEquals(plan.clients.length, 1)
  assertEquals(plan.clients[0].slug, "ghost")
})

Deno.test("pickStartPlan: runtime slug match (non-literal)", () => {
  const customWafer = { runtime: { slug: "customrt" }, clients: {} }
  const plan = pickStartPlan(customWafer, "customrt")
  assertEquals(plan.runtime, customWafer.runtime)
  assertEquals(plan.clients, [])
})

Deno.test("pickStartPlan: unknown target throws", () => {
  assertThrows(
    () => pickStartPlan(wafer, "doesnotexist"),
    Error,
    "unknown target",
  )
})

Deno.test("pickStartPlan: wafer with no clients map", () => {
  const bareWafer = { runtime: { slug: "runtime" } }
  const plan = pickStartPlan(bareWafer)
  assertEquals(plan.runtime, bareWafer.runtime)
  assertEquals(plan.clients, [])
})

Deno.test("pickStartPlan: wafer with no runtime", () => {
  const clientOnly = { clients: { foo: { slug: "foo" } } }
  const plan = pickStartPlan(clientOnly)
  assertEquals(plan.runtime, undefined)
  assertEquals(plan.clients.length, 1)
})
