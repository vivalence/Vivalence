const REFERENCE = /^\$\{([A-Z0-9_]+)\}$/;
const INLINE = /\$\{([A-Z0-9_]+)\}/g;

export default function expand(paladin) {
  const read = (key) => (key.startsWith("SECRET_") ? paladin.secret.get(key) : paladin.env.get(key));
  const blank = (value) => value === undefined || value === null || value === "";
  const walk = (node, record, at) => {
    if (typeof node === "string") {
      const whole = REFERENCE.exec(node);
      if (whole) {
        const value = read(whole[1]);
        record?.push({ at, read: [whole[1]], unset: blank(value) ? [whole[1]] : [] });
        return value;
      }
      const keys = [...node.matchAll(INLINE)].map((match) => match[1]);
      if (!keys.length) return node;
      const values = Object.fromEntries(keys.map((key) => [key, read(key)]));
      record?.push({ at, read: keys, unset: keys.filter((key) => blank(values[key])) });
      return node.replace(INLINE, (_, key) => values[key] ?? "");
    }
    if (Array.isArray(node)) return node.map((value, index) => walk(value, record, `${at}[${index}]`));
    if (node?.constructor === Object)
      return Object.fromEntries(
        Object.entries(node).map(([key, value]) => [key, walk(value, record, at ? `${at}.${key}` : key)]),
      );
    return node;
  };
  paladin.expand = (node, record = null, at = "") => walk(node, record, at);
}
