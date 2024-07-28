import { join } from "$std/path/mod.ts";
import config from "@vivalence/config";

const SCHEMA_PATH = join(config.env.get("PRISMA_DIR"), "./schema.prisma");

console.log("Migrating schema at", SCHEMA_PATH);
const process = await Deno.run({
  cmd: ["deno", "run", "-A", "npm:prisma", "migrate", "dev", `--schema=${SCHEMA_PATH}`],
}).status();
