import { visit } from "unist-util-visit"
import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"

export function remarkTangle({ root } = {}) {
  const base = root ?? "."
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      const match = /(?:^|\s)tangle=(\S+)/.exec(node.meta ?? "")
      if (!match) return
      const relative = match[1]
      const target = resolve(base, relative)
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, `${node.value}\n`)
      const badge = {
        type: "paragraph",
        data: { hProperties: { className: "tangled" } },
        children: [{ type: "text", value: `⟿ tangled → ${relative}` }],
      }
      parent.children.splice(index + 1, 0, badge)
    })
  }
}
