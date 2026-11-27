import { dirname, fromFileUrl, isAbsolute, resolve } from "@std/path";
import * as jsonc from "@std/jsonc";
import { is, Path } from "@vivalence/typology";

export const link = (paladin) => {
  paladin.link = {
    path: (token) => {
      if (typeof token === "object" && token.file) {
        return new Path(resolve(dirname(fromFileUrl(token.file)), token.source));
      }
      const target = typeof token === "string" ? token : token.source;
      if (isAbsolute(target)) return new Path(target);
      if (target.startsWith("./") || target.startsWith("../")) {
        const cwd = Deno.env.get("INIT_CWD") ?? Deno.env.get("PWD") ?? Deno.cwd();
        return new Path(resolve(cwd, target));
      }
      return paladin.scope.repository.branch(target);
    },

    env: (node, record = null, at = "") => {
      const held = (key) =>
        key.startsWith("SECRET_") ? paladin.secret.get(key) : paladin.env.get(key);
      const blank = (value) => value === undefined || value === null || value === "";
      if (typeof node === "string") {
        const whole = /^\$\{([A-Z0-9_]+)\}$/.exec(node);
        if (whole) {
          const value = held(whole[1]);
          record?.push({ at, read: [whole[1]], unset: blank(value) ? [whole[1]] : [] });
          return value;
        }
        const keys = [...node.matchAll(/\$\{([A-Z0-9_]+)\}/g)].map((match) => match[1]);
        if (!keys.length) return node;
        const values = Object.fromEntries(keys.map((key) => [key, held(key)]));
        record?.push({ at, read: keys, unset: keys.filter((key) => blank(values[key])) });
        return node.replace(/\$\{([A-Z0-9_]+)\}/g, (_, key) => values[key] ?? "");
      }
      if (Array.isArray(node)) {
        return node.map((value, index) => paladin.link.env(value, record, `${at}[${index}]`));
      }
      if (node?.constructor === Object) {
        return Object.fromEntries(
          Object.entries(node).map(([key, value]) => [
            key,
            paladin.link.env(value, record, at ? `${at}.${key}` : key),
          ]),
        );
      }
      return node;
    },

    part: (source, value, at) => {
      const origin = source.absolute ?? source;
      if (!is.string(value)) return { held: value, from: origin };
      const record = [];
      const spoken = paladin.link.env(value, record, at);
      const unset = record.flatMap((read) => read.unset);
      if (unset.length) {
        const keys = unset.join(" ");
        const reason = `"${value}" names no file and no content`;
        throw new Error(`${origin} ${at}: ${keys} unset — ${reason}`);
      }
      if (/^\s*[[{]/.test(spoken)) return { held: jsonc.parse(spoken), from: value };
      const file = isAbsolute(spoken) ? spoken : resolve(dirname(origin), spoken);
      return { path: new Path(file), from: value };
    },
  };
};
