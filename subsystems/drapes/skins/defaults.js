export function defaults(input) {
  if (!input?.properties) return {}
  const out = {}
  for (const [key, schema] of Object.entries(input.properties)) {
    if (schema.type === "number") out[key] = 5
    else if (schema.type === "integer") out[key] = 3
    else if (schema.type === "boolean") out[key] = true
    else if (schema.type === "string") out[key] = "test"
    else out[key] = null
  }
  return out
}
