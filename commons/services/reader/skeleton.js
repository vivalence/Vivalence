// structure and text VOLUME, never the text. a model reads this to point at the article.
// PURE — a node in, lines out. no imports, no bounds, no network.
export const skeleton = (root, depth = 0, out = []) => {
  for (const node of root.children ?? []) {
    const tag = node.tagName?.toLowerCase();
    if (!tag || ["script", "style", "svg", "noscript"].includes(tag)) continue;

    const id = node.getAttribute?.("id");
    const cls = (node.getAttribute?.("class") ?? "").split(/\s+/).filter(
      Boolean,
    ).slice(0, 2).join(
      ".",
    );
    const chars = (node.textContent ?? "").replace(/\s+/g, " ").trim().length;
    // deep and thin is furniture. shallow is kept whatever its size, because the article's own
    // wrapper is often near the top and mostly empty until you descend into it.
    if (chars < 400 && depth > 1) continue;

    out.push(
      `${"  ".repeat(depth)}${tag}${id ? "#" + id : ""}${
        cls ? "." + cls : ""
      } chars=${chars} p=${node.querySelectorAll?.("p").length ?? 0}`,
    );
    if (depth < 4) skeleton(node, depth + 1, out);
  }
  return out;
};
