// limit: 3000 chars
// the migration of his stored callouts (his "go migrate notes", the show amen'd 11-21): the two dataset files of
// @droneaid/topography/guides rewritten with each note's symbols pair as one `kind`. Captures first: the two files
// and a consistent copy of his instance database. The database itself is NOT written here: the next boot's own
// install patches it from the files (systems/runtime/subjects/mode/traits/dataset.js).
// run: deno run -A --no-check --config deno.jsonc .ikiro/reference/m127/migrate-notes.js
import { migrated } from "./migrate-notes.probe.js";

const DATASET = "/Users/finn/.viva/registry/droneaid/topographies/guides/dataset/literals";
const DB = "/Users/finn/.viva/instances/localhost/mountpoint/localhost.viva.db";
const BAK = "/Users/finn/.viva/bak/registry/droneaid-notes-20261121";
const FILES = ["steps.js", "guides.js"];

const written = (literals) => `export default ${JSON.stringify(literals, null, 2)};\n`;

const held = {};
for (const file of FILES) {
  const literals = (await import(`${DATASET}/${file}`)).default;
  const text = await Deno.readTextFile(`${DATASET}/${file}`);
  if (written(literals) !== text) throw new Error(`${file}: this writer does not reproduce the file as it stands — nothing written`);
  held[file] = literals;
}

try {
  await Deno.stat(BAK);
  throw new Error(`capture exists: ${BAK} — nothing written`);
} catch (error) {
  if (!(error instanceof Deno.errors.NotFound)) throw error;
}
await Deno.mkdir(BAK, { recursive: true });
for (const file of FILES) await Deno.copyFile(`${DATASET}/${file}`, `${BAK}/${file}`);
const backup = await new Deno.Command("sqlite3", { args: ["-readonly", DB, `.backup '${BAK}/localhost.viva.db'`] }).output();
if (!backup.success) throw new Error(`database capture failed: ${new TextDecoder().decode(backup.stderr)} — nothing written`);

for (const file of FILES) {
  await Deno.writeTextFile(`${DATASET}/${file}`, written(held[file].map(migrated)));
  console.log(JSON.stringify({ written: file, literals: held[file].length }));
}
