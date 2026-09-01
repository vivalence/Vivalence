import { getCollection } from "astro:content"
import { readFile } from "node:fs/promises"

export async function getStaticPaths() {
  const docs = await getCollection("docs")
  return docs.map((entry) => ({ params: { id: entry.id }, props: { entry } }))
}

export async function GET({ props }) {
  const { entry } = props
  const source = entry.filePath ? await readFile(entry.filePath, "utf8") : (entry.body ?? "")
  return new Response(source, { headers: { "content-type": "text/plain; charset=utf-8" } })
}
