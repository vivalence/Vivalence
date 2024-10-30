import { join } from "$std/path/mod.ts";
import config from "@vivalence/config";

async function deploy() {
  const SCHEMA_PATH = join(config.env.get("SCHEMA_ROOT_DIR"), "./dist/schema.prisma");
  console.log("Migrating schema at", SCHEMA_PATH);

  const process = await Deno.run({
    cmd: ["deno", "run", "-A", "npm:prisma", "migrate", "dev", `--schema=${SCHEMA_PATH}`],
  }).status();

  Deno.exit(0);
}

await deploy();
// TODO:
// deploy compiled SQL to database
