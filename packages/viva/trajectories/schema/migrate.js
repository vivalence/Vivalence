// import fs from "fs-extra";
import { colors } from "@cliffy/ansi/colors";

// import { Prompt } from "@vivalence/interfaces-cli";
// import config from "@vivalence/config";

export const match = "/migrate";
export const name = "migrate database schema";

export default async (ctx) => {
  console.log(colors.yellow("migrate schema..."));

  const migrator = ctx.entities.orm.getMigrator();
  await migrator.createMigration();
  const migrated = await migrator.up();
  console.log("migrated:", migrated);

  // const migrator = ctx.entities.em.
  // return {status: "success", message: "Schema has been reset successfully",};
};
