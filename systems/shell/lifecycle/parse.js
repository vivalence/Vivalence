export default function parse(args) {
  const flags = {}
  const rest = []

  for (const arg of args) {
    if (arg.startsWith("--")) {
      const key = arg.slice(2)
      const eq = key.indexOf("=")
      if (eq > -1) flags[key.slice(0, eq)] = key.slice(eq + 1)
      else flags[key] = true
    } else {
      rest.push(arg)
    }
  }

  let body = {}
  let argv = rest

  for (let i = rest.length - 1; i >= 0; i--) {
    try {
      const parsed = JSON.parse(rest[i])
      if (typeof parsed === "object" && parsed !== null) {
        body = parsed
        argv = [...rest.slice(0, i), ...rest.slice(i + 1)]
        break
      }
    } catch {}
  }

  const signal = argv.shift() || ""

  return { flags, signal, body, argv }
}
