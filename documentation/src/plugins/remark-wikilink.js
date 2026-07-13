import { visit } from "unist-util-visit"

export function remarkWikilink() {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      if (!node.value.includes("[[")) return
      const pattern = /\[\[([^\]]+)\]\]/g
      const segments = []
      let cursor = 0
      let match
      while ((match = pattern.exec(node.value))) {
        if (match.index > cursor) segments.push({ type: "text", value: node.value.slice(cursor, match.index) })
        segments.push({ type: "link", url: `/${match[1]}`, children: [{ type: "text", value: match[1] }] })
        cursor = match.index + match[0].length
      }
      if (!segments.length) return
      if (cursor < node.value.length) segments.push({ type: "text", value: node.value.slice(cursor) })
      parent.children.splice(index, 1, ...segments)
    })
  }
}
