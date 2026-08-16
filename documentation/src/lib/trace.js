const snapshots = import.meta.glob("../../content/**/*.snapshot.json", { eager: true })
const byName = Object.fromEntries(Object.entries(snapshots).map(([path, module]) => [path.split("/").pop(), module]))

export const capture = (name) => byName[`${name}.snapshot.json`]?.default ?? null

export function fold(records = []) {
  let depth = 0
  const openedAt = []
  return records.map((record) => {
    let duration = null
    if (record.verb === "close") {
      depth = Math.max(0, depth - 1)
      const opened = openedAt.pop()
      if (opened != null && record.at != null) duration = `${(record.at - opened).toFixed(1)}ms`
    }
    const row = { verb: record.verb, path: record.path, data: record.data, depth, duration }
    if (record.verb === "open") {
      openedAt.push(record.at ?? null)
      depth += 1
    }
    return row
  })
}
