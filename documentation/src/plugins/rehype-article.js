import { visit } from "unist-util-visit"

export function rehypeArticle() {
  return (tree) => {
    let heading = null
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "h1" || heading) return
      heading = node
      const first = node.children?.[0]
      if (first?.type !== "text") return
      const match = /^(\d{2}\.\d{2})(\s*·\s*)(.*)$/.exec(first.value)
      if (!match) return
      node.children.splice(0, 1,
        {
          type: "element",
          tagName: "span",
          properties: { className: ["h1num"] },
          children: [{ type: "text", value: match[1] }],
        },
        { type: "text", value: `${match[2]}${match[3]}` },
      )

      let after = index + 1
      while (after < parent.children.length && parent.children[after].type === "text" && !parent.children[after].value.trim()) after += 1
      const candidate = parent.children[after]
      if (candidate?.tagName !== "p" || candidate.children?.length !== 1) return
      const emphasis = candidate.children[0]
      if (emphasis?.tagName !== "em") return
      candidate.properties = { ...candidate.properties, className: ["lede"] }
      candidate.children = emphasis.children
    })
  }
}
