import { Pattern, Signal } from "@vivalence/typology"

export const name = "42.02-signature"

export function run() {
  // A Pattern DECLARES. Each segment probes into one of four types.
  const pattern = new Pattern("/users/:id/*/(.*)")
  console.log("declared →", JSON.stringify(pattern.json))

  // A Signal DISPATCHES. Same grammar, but it also parses flags.
  const signal = new Signal("/system/doctor --json --depth 3 -v")
  console.log("signal   →", JSON.stringify(signal.pathname))
  console.log("flags    →", JSON.stringify(signal.json.flags))

  // `--` terminates flag parsing; everything after is a segment.
  const terminated = new Signal("/run -- --not-a-flag")
  console.log("after -- →", JSON.stringify(terminated.absolute))

  // Clustered short flags expand: -abc → a,b,c
  const clustered = new Signal("/x -abc")
  console.log("cluster  →", JSON.stringify(clustered.json.flags))

  // A flags-only signal has a null nature — it addresses the root.
  const bare = new Signal("--json")
  console.log("bare     →", JSON.stringify({ nature: bare.nature, flags: bare.flags }))

  // Matching is Pattern.apply(signal) → a match, or null.
  const literal = new Pattern("users")
  console.log("literal  →", literal.apply(new Signal("users").array[0]) ? "match" : "null")
  console.log("mismatch →", literal.apply(new Signal("posts").array[0]) ? "match" : "null")

  const parameter = new Pattern(":id")
  const bound = parameter.apply(new Signal("42").array[0])
  console.log("param    →", JSON.stringify(bound.parameters))

  if (pattern.json.types.join(",") !== "literal,parameter,wildcard,remainder")
    throw new Error(`four segment types expected, got ${pattern.json.types}`)
  if (signal.json.flags.json !== true) throw new Error("valueless flag should be true")
  if (signal.json.flags.depth !== "3") throw new Error("valued flag should carry its value")
  if (terminated.absolute.includes("--not-a-flag") === false)
    throw new Error("-- should demote the rest to segments")
  if (bare.nature !== null) throw new Error("a flags-only signal has no nature")
  if (bound.parameters.id !== "42") throw new Error(":id should bind 42")
  console.log("tests    →", "6 assertions passed")
}
