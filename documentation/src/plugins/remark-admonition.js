import { visit } from "unist-util-visit"

const kinds = {
  note: "ℹ note",
  tip: "✔ tip",
  info: "ℹ info",
  warning: "⚠ warning",
  danger: "✖ danger",
}

export function remarkAdmonition() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== "containerDirective") return
      const label = kinds[node.name]
      if (!label) return
      node.data ??= {}
      node.data.hName = "aside"
      node.data.hProperties = { className: `admonition ${node.name}` }
      node.children.unshift({
        type: "paragraph",
        data: { hProperties: { className: "admonition-label" } },
        children: [{ type: "text", value: label }],
      })
    })
  }
}
