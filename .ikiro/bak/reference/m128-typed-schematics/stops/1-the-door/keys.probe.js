import { v } from "../s1/typology/schematics/v.js";

const twin = Deno.readTextFileSync(new URL("../s1/typology/schematics/v.d.ts", import.meta.url));
const source = Deno.readTextFileSync(new URL("../s1/typology/schematics/v.js", import.meta.url));

const body = twin.slice(twin.indexOf("export const v: {"));
const declared = [...body.matchAll(/^  ([a-zA-Z$]+)[<(:]/gm)].map((match) => match[1]);
const live = Object.keys(v);

const methods = twin.slice(twin.indexOf("export type Schematic"), twin.indexOf("type Literals"));
const typed = [...methods.matchAll(/^  ([a-zA-Z$]+)[<(]/gm)].map((match) => match[1]);
const proxied = [...source.matchAll(/prop === "([a-zA-Z$]+)"/g)].map((match) => match[1]).concat(["desc", "descr"]);

const missing = (from, into) => from.filter((name) => !into.includes(name));

console.log(
  JSON.stringify(
    {
      v: { live: live.length, declared: declared.length, liveOnly: missing(live, declared), twinOnly: missing(declared, live) },
      schematic: {
        proxied: [...new Set(proxied)].length,
        typed: typed.length,
        proxyOnly: missing([...new Set(proxied)], typed),
        twinOnly: missing(typed, proxied),
      },
    },
    null,
    2,
  ),
);
