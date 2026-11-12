// limit: 1500 chars
import paladin, { factories } from "@vivalence/paladin";
import { DatabaseSync } from "node:sqlite";

await factories.instance(paladin.instance);
const mountpoint = paladin.scope.mountpoint.absolute;
const database = new DatabaseSync(`${mountpoint}/${paladin.instance.manifest.slug}.viva.db`, { readOnly: true });
const live = new Set(database.prepare("select mount from File where mount like '%/bundle/%'").all().map((file) => file.mount));
database.close();

const bundlers = await paladin.bundler.under(mountpoint);
const plan = await Promise.all(bundlers.map((bundler) => bundler.prune({ dry: true })));
const removed = plan.flatMap((held) => held.removed.map((artifact) => `${held.directory}/bundle/${artifact.name}`));
console.log(JSON.stringify({
  directories: bundlers.length,
  kept: plan.reduce((sum, held) => sum + held.kept, 0),
  removed: removed.length,
  megabytes: Math.round(plan.reduce((sum, held) => sum + held.bytes, 0) / 1e6),
  liveArtifacts: live.size,
  liveRemoved: removed.filter((path) => live.has(path)).map((path) => path.replace(`${mountpoint}/`, "")),
}, null, 2));
Deno.exit(0);
