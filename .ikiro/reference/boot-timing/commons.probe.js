// limit: 1200 chars
import paladin, { factories } from "@vivalence/paladin";

await factories.instance(paladin.instance);
const commons = paladin.scope.repository.branch("commons");
let started = performance.now();
const paths = await paladin.find.viva(commons);
const walk = Math.round(performance.now() - started);
const seen = [];
for (const path of paths) {
  started = performance.now();
  await paladin.read.viva(path).catch((error) => error);
  seen.push({ module: String(path).replace(`${commons.absolute}/`, ""), ms: Math.round(performance.now() - started) });
}
console.log("walk", walk, "ms ·", paths.length, "modules ·", seen.reduce((sum, held) => sum + held.ms, 0), "ms imported");
console.table(seen.sort((a, b) => b.ms - a.ms).slice(0, 12));
Deno.exit(0);
