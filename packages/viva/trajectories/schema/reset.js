import fs from "fs-extra";
import { colors } from "@cliffy/ansi/colors";

// import { Prompt } from "@vivalence/interfaces-cli";
import config from "@vivalence/config";

export const match = "/reset";
export const name = "Reset database schema";

export default async (ctx) => {
  console.log(colors.yellow("Resetting schema..."));

  const tableName = config.env.get("VIVA_DATABASE_MIGRATIONS_TABLE");
  const migrationsPath = config.env.get("VIVA_DATABASE_MIGRATIONS_PATH");

  const deleted = [
    await ctx.entities.em.execute(`DROP TABLE IF EXISTS ${tableName}`),
    await fs.remove(migrationsPath),
  ];
  console.log("deleted table, dir:", deleted);

  const migrator = ctx.entities.orm.getMigrator();
  await migrator.createMigration();

  const migrated = await migrator.up();
  console.log("migrated", migrated);

  // return {status: "success", message: "Schema has been reset successfully",};
};
