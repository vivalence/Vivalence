import { boot, revive } from "../../../systems/runtime/tests/scenarios/hello.js";
import { DatabaseSync } from "node:sqlite";
import { join } from "@std/path";

const MARKER = Deno.args[0];
const DENO_JSONC = new URL("../../../deno.jsonc", import.meta.url).pathname;

const heard = () => {
  const text = Deno.readTextFileSync(MARKER);
  Deno.writeTextFileSync(MARKER, "");
  return text.trim().split("\n").filter(Boolean);
};
const stamps = (world) => world.query("select name from _mikro_migrations order by id").map((row) => row.name);
const report = (title, world) => console.log(`\n== ${title}\n`, { migrations: stamps(world), heard: heard() });

const halt = async (world) => {
  world.child.kill("SIGKILL");
  await world.child.status;
};

Deno.writeTextFileSync(MARKER, "");

let world = await boot({ prefix: "viva-migrate-" });
report("1 · fresh mount, 2026.11.0", world);
await halt(world);

world = await revive(world);
report("2 · second boot, nothing changed", world);
await halt(world);

const database = new DatabaseSync(join(world.root, "instance/mountpoint/hello-world.viva.db"));
database.exec("update _mikro_migrations set name = 'Migration20261118150121'");
database.close();
const migrations = join(world.root, "instance/mountpoint/migrations");
for (const entry of Deno.readDirSync(migrations)) {
  if (entry.name.includes("@")) Deno.renameSync(join(migrations, entry.name), join(migrations, "Migration20261118150121.ts"));
}
world = await revive(world);
report("3 · an unstamped mount (prod's shape) boots on 2026.11.0", world);
await halt(world);

const config = Deno.readTextFileSync(DENO_JSONC);
Deno.writeTextFileSync(DENO_JSONC, config.replace('"version": "2026.11.0"', '"version": "2026.11.1"'));
world = await revive(world);
report("4 · the repo moves to 2026.11.1", world);
const status = await world.get("/beacon/status");
console.log("\n/beacon/status", status.status, await status.text());
await world.stop();
Deno.writeTextFileSync(DENO_JSONC, config);
