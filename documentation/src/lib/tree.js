export function flatten(pages) {
  return [...pages].sort((left, right) => left.jdex.localeCompare(right.jdex))
}

export function buildTree(pages) {
  const areas = {}
  for (const page of flatten(pages)) {
    const category = Number(page.jdex.split(".")[0])
    const decade = Math.floor(category / 10) * 10
    const area = `${decade}–${decade + 9}`
    areas[area] ??= {}
    areas[area][category] ??= []
    areas[area][category].push(page)
  }
  return areas
}

export function breadcrumb(jdex) {
  const category = Number(jdex.split(".")[0])
  const decade = Math.floor(category / 10) * 10
  return [`${decade}–${decade + 9}`, String(category), jdex]
}
