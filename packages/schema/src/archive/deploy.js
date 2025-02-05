import config from "@vivalence/config";
import { colors } from "@vivalence/interfaces-cli";

import compile from "./compile.js";
import prisma from "./lib/prisma-cli.js";

export default async function deploy({ database }) {
  console.log(colors.blue("Starting database migration..."));

  await compile();

  const migration = await prisma.migrate({ database });

  if (migration.stderr) {
    console.log(colors.red("[schema/deploy] ERROR at migration:"), migration);
    throw new Error(migration.stderr);
  }

  console.log(colors.blue("database migrated!"));
  return migration;
}
