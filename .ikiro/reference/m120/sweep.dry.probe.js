// limit: 1500 chars
import paladin from "@vivalence/paladin";
const root = `${Deno.env.get("HOME")}/.viva/instances/localhost/mountpoint`;
const bundlers = await paladin.bundler.under(root);
const plan = await Promise.all(bundlers.map((bundler) => bundler.prune({ dry: true })));
const rows = plan.map((held) => ({ dir: held.directory.slice(root.length + 1), kept: held.kept, removed: held.removed.length, MB: +(held.bytes / 1e6).toFixed(1) }));
console.table(rows);
console.log(JSON.stringify({ dirs: rows.length, kept: rows.reduce((s, r) => s + r.kept, 0), removed: rows.reduce((s, r) => s + r.removed, 0), MB: +rows.reduce((s, r) => s + r.MB, 0).toFixed(0) }));
