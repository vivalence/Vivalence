export function json(data) {
  console.log(JSON.stringify(data, null, 2))
}

export function table(rows, columns) {
  if (!rows?.length) return console.log("(empty)")

  const keys = columns || Object.keys(rows[0])
  const widths = keys.map((k) =>
    Math.max(k.length, ...rows.map((r) => String(r[k] ?? "").length))
  )

  const header = keys.map((k, i) => k.padEnd(widths[i])).join("  ")
  const separator = widths.map((w) => "─".repeat(w)).join("──")

  console.log(header)
  console.log(separator)
  for (const row of rows) {
    console.log(keys.map((k, i) => String(row[k] ?? "").padEnd(widths[i])).join("  "))
  }
}

export function text(data) {
  if (data === null || data === undefined) return
  if (typeof data === "string") return console.log(data)
  if (Array.isArray(data)) return table(data)
  console.log(JSON.stringify(data, null, 2))
}

export function create(isAgent) {
  return {
    print: isAgent ? json : text,
    json,
    table,
    text,
    error(message) {
      if (isAgent) json({ error: message })
      else console.error(`error: ${message}`)
    },
    ok(message) {
      if (isAgent) json({ ok: true, message })
      else console.log(message)
    },
  }
}
