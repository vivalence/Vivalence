import prisma from "./lib/prisma-cli.js";
import concatenator from "./lib/concat.js";

import { prismaPath, prismaRootDir } from "./statics.js";

async function compile() {
  const schema = await concatenator(prismaRootDir);
  await Deno.writeTextFile(prismaPath, schema);

  await prisma.format({ path: prismaPath });

  // // compile sql - unused aot.
  //  const sqlPath = join(root, "./dist/schema.sql"); await new Deno.Command("bash", {cwd: join(root, "./src/sql"), args: ["compile_sql.sh", sqlPath],}).output();

  // return { prisma: { path: prismaPath } }; // , migrations: "/",  sql: sqlPath
}

export default compile;
