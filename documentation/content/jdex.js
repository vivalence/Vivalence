import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

// the filesystem is the source of the map: content/NN-NN_area/NN_category/NN.NN_page.mdx
// naming: an NN.00_*.mdx index stub (frontmatter title + summary) names its area or
// category; without one, the directory name is the name (hyphens read as spaces)
const root = join(process.cwd(), "content")

const frontmatter = (path) => {
  const text = readFileSync(path, "utf8")
  return {
    title: text.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1],
    summary: text.match(/^summary:\s*["']?(.+?)["']?\s*$/m)?.[1],
  }
}

const indexOf = (dir, number) => {
  const name = readdirSync(dir).find((entry) => entry.startsWith(`${number}.00_`) && entry.endsWith(".mdx"))
  return name ? frontmatter(join(dir, name)) : {}
}

export const AREAS = {}
export const CATEGORIES = {}
for (const area of readdirSync(root, { withFileTypes: true })) {
  const areaMatch = area.isDirectory() && area.name.match(/^(\d{2})-\d{2}_(.+)$/)
  if (!areaMatch) continue
  const decade = Number(areaMatch[1])
  const areaDir = join(root, area.name)
  const areaIndex = indexOf(areaDir, decade)
  AREAS[decade] = {
    title: areaIndex.title ?? areaMatch[2].replaceAll("-", " "),
    note: areaIndex.summary ?? "",
  }
  CATEGORIES[decade] = AREAS[decade].title
  for (const entry of readdirSync(areaDir, { withFileTypes: true })) {
    const match = entry.isDirectory() && entry.name.match(/^(\d{2})_(.+)$/)
    if (!match) continue
    const category = Number(match[1])
    const categoryIndex = indexOf(join(areaDir, entry.name), category)
    CATEGORIES[category] = categoryIndex.title ?? match[2].replaceAll("-", " ")
  }
}

// pages: routing from the filename (NN.NN_slug), display from frontmatter, routing fallback
export const page = (entry) => {
  const [jdex, ...rest] = entry.id.split("_")
  return {
    slug: entry.id,
    jdex,
    title: entry.data.title ?? rest.join("_").replaceAll("-", " "),
  }
}

export const decadeOf = (category) => Math.floor(category / 10) * 10;

export const areaKey = (decade) =>
  `${String(decade).padStart(2, "0")}–${String(decade + 9).padStart(2, "0")}`;

export const areaName = (key) => AREAS[Number(String(key).split("–")[0])]?.title ?? "";

export const areaNote = (key) => AREAS[Number(String(key).split("–")[0])]?.note ?? "";

export const categoryName = (category) => CATEGORIES[category] ?? String(category);

export const isReserved = (decade) => AREAS[decade]?.title === "Reserved";
