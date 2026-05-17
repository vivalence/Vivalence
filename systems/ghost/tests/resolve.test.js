import { assertEquals } from "@std/assert"
import { Vector } from "@vivalence/typology"
import resolve from "../lifecycle/resolve.js"

function buildTrajectory() {
  const trajectory = new Vector()

  const auth = trajectory.branch("/auth")
  auth.open("/login", () => {})
  auth.open("/logout", () => {})

  const install = trajectory.branch("/install")
  install.open("/wafer", () => {})

  trajectory.open("/status", () => {})
  return trajectory
}

Deno.test("resolve: install wafer + slug + path", () => {
  const trajectory = buildTrajectory()
  const result = resolve(trajectory, ["install", "wafer", "@vivalence/foo", "/path"])
  assertEquals(result.signal, "install/wafer")
  assertEquals(result.argv, ["@vivalence/foo", "/path"])
})

Deno.test("resolve: auth login + bare-ident argv", () => {
  const trajectory = buildTrajectory()
  const result = resolve(trajectory, ["auth", "login", "beef", "biggusdickus"])
  assertEquals(result.signal, "auth/login")
  assertEquals(result.argv, ["beef", "biggusdickus"])
})

Deno.test("resolve: root effect (single-segment signal)", () => {
  const trajectory = buildTrajectory()
  const result = resolve(trajectory, ["status"])
  assertEquals(result.signal, "status")
  assertEquals(result.argv, [])
})

Deno.test("resolve: legacy slash-form signal", () => {
  const trajectory = buildTrajectory()
  const result = resolve(trajectory, ["auth/login", "beef", "pass"])
  assertEquals(result.signal, "auth/login")
  assertEquals(result.argv, ["beef", "pass"])
})

Deno.test("resolve: unknown command — empty signal, all argv", () => {
  const trajectory = buildTrajectory()
  const result = resolve(trajectory, ["unknown", "thing"])
  assertEquals(result.signal, "")
  assertEquals(result.argv, ["unknown", "thing"])
})

Deno.test("resolve: empty positional", () => {
  const trajectory = buildTrajectory()
  const result = resolve(trajectory, [])
  assertEquals(result.signal, "")
  assertEquals(result.argv, [])
})

Deno.test("resolve: trajectory prefix without leaf — argv = remainder", () => {
  const trajectory = buildTrajectory()
  const result = resolve(trajectory, ["auth"])
  assertEquals(result.signal, "auth")
  assertEquals(result.argv, [])
})
