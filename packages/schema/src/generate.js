import config from "./mikro-orm.config.ts";

import mikroConfig from "./mikro-orm.config.ts";
import { MikroORM } from "@mikro-orm/core";
// import { prismaPath, prismaRootDir } from "./statics.js";

async function generate() {
  const path = process.cwd() + "/src/entities";

  const orm = await MikroORM.init({ ...mikroConfig });

  const dump = await orm.entityGenerator.generate({
    save: true,
    path,
    useCoreBaseEntity: true,
    bidirectionalRelations: true,

    // readOnlyPivotTables: true,
    // outputPurePivotTables: true,

    esmImport: true,
    entitySchema: true,
    // customBaseEntityName: "Base",
    onImport: (name, path, ending, filename) => {
      return { path: "./" + name + ".ts", name };
    },

    // fileName: (entityName) => {
    //   switch (entityName) {
    //     default:
    //       return `${entityName.toLowerCase()}.entity`;
    //   }
    // },
  });
  // console.log("dump", dump);
  // console.log("orm", orm);
  // await orm.close(true);
  return;
}

await generate();
Deno.exit();
