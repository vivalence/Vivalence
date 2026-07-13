import { visit } from "unist-util-visit"

export function remarkCodetitle() {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      if (/tangle=/.test(node.meta ?? "")) return
      const match = /(?:^|\s)title="([^"]+)"/.exec(node.meta ?? "")
      if (!match) return
      node.meta = node.meta.replace(/(?:^|\s)title="[^"]+"/, "").trim() || null
      parent.children.splice(index, 0, {
        type: "paragraph",
        data: { hProperties: { className: "code-filename" } },
        children: [{ type: "text", value: match[1] }],
      })
    })
  }
}
