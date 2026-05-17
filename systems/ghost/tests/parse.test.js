import { assertEquals } from "@std/assert"
import parse from "../lifecycle/parse.js"

Deno.test("parse: positionals collected, no signal split", () => {
  const result = parse(["install", "wafer", "@vivalence/foo", "/path"])
  assertEquals(result.positional, ["install", "wafer", "@vivalence/foo", "/path"])
  assertEquals(result.body, {})
  assertEquals(result.flags, {})
})

Deno.test("parse: trailing JSON becomes body", () => {
  const result = parse(["install", "wafer", "foo", "/p", '{"force":true}'])
  assertEquals(result.positional, ["install", "wafer", "foo", "/p"])
  assertEquals(result.body, { force: true })
})

Deno.test("parse: flags extracted", () => {
  const result = parse(["--force", "install", "wafer", "@vivalence/foo", "/p"])
  assertEquals(result.flags, { force: true })
  assertEquals(result.positional, ["install", "wafer", "@vivalence/foo", "/p"])
})

Deno.test("parse: --key=value flag", () => {
  const result = parse(["--mode=fast", "status"])
  assertEquals(result.flags, { mode: "fast" })
  assertEquals(result.positional, ["status"])
})

Deno.test("parse: trailing JSON array NOT taken as body", () => {
  const result = parse(["status", "[1,2,3]"])
  assertEquals(result.positional, ["status"])
  assertEquals(result.body, [1, 2, 3])
})
