const classes = (element) => [...element.classList].filter((name) => name !== "").sort().map((name) => `.${name}`).join("");

const said = (text) => text.replace(/\s+/g, " ").trim();

const merged = (nodes) =>
  nodes.reduce((held, node) => {
    if (node.nodeType === 3 && held.length > 0 && held.at(-1).nodeType === 3) return [...held.slice(0, -1), { nodeType: 3, data: held.at(-1).data + node.data }];
    return [...held, node];
  }, []);

export const shape = (node) => {
  if (node.nodeType === 3) return said(node.data) === "" ? "" : JSON.stringify(said(node.data));
  if (node.nodeType !== 1) return "";
  const tag = node.tagName.toLowerCase();
  if (tag === "svg") return `svg${classes(node)}`;
  const inner = merged([...node.childNodes]).map(shape).filter((part) => part !== "");
  return `${tag}${classes(node)}${inner.length === 0 ? "" : `(${inner.join(" ")})`}`;
};

export const shaped = (element) => merged([...element.childNodes]).map(shape).filter((part) => part !== "").join(" ");

export const oracle = (html, document = globalThis.document) => {
  const holder = document.createElement("div");
  holder.innerHTML = html;
  return shaped(holder);
};
