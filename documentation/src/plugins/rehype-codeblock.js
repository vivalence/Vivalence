import { visit, SKIP } from "unist-util-visit"

const hasClass = (node, name) =>
  node?.type === "element" && (node.properties?.className ?? []).includes(name)

const textOf = (node) => {
  if (node.type === "text") return node.value
  return (node.children ?? []).map(textOf).join("")
}

const span = (className, value) => ({
  type: "element",
  tagName: "span",
  properties: { className: [className] },
  children: [{ type: "text", value }],
})

export function rehypeCodeblock() {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (!parent || node.tagName !== "pre") return
      if (hasClass(parent, "codeblock")) return SKIP
      const codeChild = node.children?.find((child) => child.tagName === "code")
      if (!codeChild && !hasClass(node, "astro-code")) return

      const language =
        (codeChild?.properties?.className ?? [])
          .find((name) => String(name).startsWith("language-"))
          ?.slice("language-".length) ??
        node.properties?.dataLanguage ??
        ""

      let filename = null
      let before = index - 1
      while (before >= 0 && parent.children[before].type === "text" && !parent.children[before].value.trim()) before -= 1
      if (before >= 0 && hasClass(parent.children[before], "code-filename")) {
        filename = textOf(parent.children[before]).trim()
        parent.children.splice(before, 1)
        index = parent.children.indexOf(node)
      }

      let tangled = null
      let after = index + 1
      while (after < parent.children.length && parent.children[after].type === "text" && !parent.children[after].value.trim()) after += 1
      if (after < parent.children.length && hasClass(parent.children[after], "tangled")) {
        const path = textOf(parent.children[after]).replace(/^.*→\s*/, "").trim()
        tangled = {
          type: "element",
          tagName: "div",
          properties: { className: ["tangled"] },
          children: [span("arw", "⟿"), { type: "text", value: " tangled → " }, span("path", path)],
        }
        parent.children.splice(after, 1)
      }

      const head = {
        type: "element",
        tagName: "div",
        properties: { className: ["code-head"] },
        children: [
          span("dot", ""),
          ...(filename ? [span("fname", filename)] : []),
          ...(language ? [span("lang", language)] : []),
          {
            type: "element",
            tagName: "button",
            properties: { type: "button", className: ["copy"], dataCopy: "" },
            children: [{ type: "text", value: "Copy" }],
          },
        ],
      }

      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["codeblock"], dataCode: "" },
        children: [head, node, ...(tangled ? [tangled] : [])],
      }
      return SKIP
    })
  }
}
