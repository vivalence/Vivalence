import { areaKey, areaName, categoryName, decadeOf } from "../../content/_site/jdex.js"

export function flatten(pages) {
  return [...pages].sort((left, right) => left.jdex.localeCompare(right.jdex))
}

export function breadcrumb(jdex) {
  const category = Number(jdex.split(".")[0])
  const key = areaKey(decadeOf(category))
  const area = areaName(key) ? `${key} ${areaName(key).toLowerCase()}` : key
  return [area, `${category} ${categoryName(category)}`, jdex]
}
