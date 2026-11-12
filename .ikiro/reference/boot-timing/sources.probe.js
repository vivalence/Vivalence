// limit: 1800 chars
import { resolve } from "@std/path";

const HOME = Deno.env.get("HOME");
const BUNDLE = `${HOME}/.viva/instances/localhost/mountpoint/daemon_spanish/mode_homepage_aprende/bundle/062c91e878bac4c1.dom.svelte.mjs`;
const base = new URL("../../../systems/runtime/", import.meta.url).pathname;
const text = await Deno.readTextFile(BUNDLE);
const named = [...text.matchAll(/^\/\/ ((?:\.\.?\/|[\w@])[^\n]*\.(?:js|ts|svelte|mjs|css))$/gm)].map((held) => held[1]);
const paths = [...new Set(named.map((path) => resolve(base, path)))];
const stamp = async (path) => {
  const held = await Deno.stat(path).catch(() => null);
  return held === null ? null : { path, bytes: held.size, mtime: held.mtime.toISOString() };
};
const started = performance.now();
const sources = await Promise.all(paths.map(stamp));
const spent = performance.now() - started;
const found = sources.filter((held) => held !== null);
console.log(JSON.stringify({
  view: "homepage/aprende dom.svelte",
  named: paths.length,
  found: found.length,
  statMs: Number(spent.toFixed(1)),
  jsonKilobytes: Math.round(JSON.stringify(found).length / 1024),
  outsideNodeModules: found.filter((held) => !held.path.includes("/node_modules/")).length,
}, null, 2));
Deno.exit(0);
