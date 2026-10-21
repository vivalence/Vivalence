const KEPT = ["class", "style", "title", "role", "aria-label", "aria-expanded", "data-zone", "id", "placeholder"];

const normal = {
  class: (value) => value.split(/\s+/).filter((token) => token !== "").sort().join(" "),
  style: (value) => value.replace(/\s+/g, "").replace(/;$/, ""),
};

const attributes = (element) =>
  KEPT.filter((name) => element.hasAttribute(name))
    .map((name) => [name, name in normal ? normal[name](element.getAttribute(name)) : element.getAttribute(name)])
    .filter(([name, value]) => !(name === "class" && value === ""))
    .map(([name, value]) => `${name}=${JSON.stringify(value)}`);

const runs = (nodes) =>
  nodes.reduce((held, node) => {
    if (node.nodeType === 3 && held.length > 0 && held.at(-1).nodeType === 3) return [...held.slice(0, -1), { nodeType: 3, data: held.at(-1).data + node.data }];
    return [...held, node];
  }, []);

const VOID = ["textarea"];

export const tree = (node) => {
  if (node.nodeType === 3) return node.data.trim() === "" ? [] : [JSON.stringify(node.data.trim())];
  if (node.nodeType !== 1) return [];
  const head = [node.tagName.toLowerCase(), ...attributes(node)].join(" ");
  const children = VOID.includes(node.tagName.toLowerCase()) ? [] : runs([...node.childNodes]).flatMap(tree);
  return [children.length === 0 ? `(${head})` : `(${head} ${children.join(" ")})`];
};

export const shape = (element) => runs([...element.childNodes]).flatMap(tree).join("\n");

export const oracle = (html, document = globalThis.document) => {
  const held = document.createElement("div");
  held.innerHTML = html;
  return shape(held);
};
