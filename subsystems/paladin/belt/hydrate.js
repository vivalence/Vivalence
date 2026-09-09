import { is } from "@vivalence/typology";

const watch = (bag, read) =>
  new Proxy(bag, {
    get: (target, prop, receiver) =>
      prop === "get"
        ? (key, ...rest) => {
            const value = target.get(key, ...rest);
            read.push({ key, unset: is.empty(value) });
            return value;
          }
        : Reflect.get(target, prop, receiver),
  });

export default function hydrate(paladin) {
  const fire = (node, record, at) => {
    if (typeof node === "function") {
      if (!record) return fire(node(), null, at);
      const read = [];
      const { env, secret } = paladin;
      paladin.env = watch(env, read);
      paladin.secret = watch(secret, read);
      let value;
      try {
        value = node();
      } finally {
        paladin.env = env;
        paladin.secret = secret;
      }
      record.push({
        at,
        read: read.map((held) => held.key),
        unset: read.filter((held) => held.unset).map((held) => held.key),
      });
      return fire(value, record, at);
    }
    if (Array.isArray(node)) return node.map((value, index) => fire(value, record, `${at}[${index}]`));
    if (node?.constructor === Object)
      return Object.fromEntries(
        Object.entries(node).map(([key, value]) => [key, fire(value, record, at ? `${at}.${key}` : key)]),
      );
    return node;
  };

  paladin.hydrate = (node, record = null, at = "") => fire(node, record, at);
}
