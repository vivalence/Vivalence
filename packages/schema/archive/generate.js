import config from "./mikro-orm.config.ts";

import mikroConfig from "./mikro-orm.config.ts";
import { MikroORM } from "@mikro-orm/postgresql";
// import { MikroORM } from "@mikro-orm/core";
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
    // onImport: (...args) => {
    //   console.log("onImport", args);
    //   //   console.log(`name: ${name}, path: ${path}, ending: ${ending}, filename: ${filename}`);
    //   return { path: "./js", name: "file" };
    // },
    fileName: (entityName) => {
      const rootEntities = ["PrismaMigrations", "User"];
      if (rootEntities.includes(entityName)) {
        return "0_root/" + entityName;
      }

      const repoEntities = ["Runtime", "Daemon", "Service"];
      if (repoEntities.includes(entityName)) {
        return "1_repo/" + entityName;
      }

      const runtimeEntities = ["Domain", "Ontology", "Curriculum", "Strategy", "Game"];
      if (runtimeEntities.includes(entityName)) {
        return "2_runtime/" + entityName;
      }

      const curriculaEntities = ["Unit", "Tag", "Dependency", "Condition", "Tactic"];
      if (curriculaEntities.includes(entityName)) {
        return "3_curricula/" + entityName;
      }

      const userlandEntities = ["Play", "Memory", "Session"];
      if (userlandEntities.includes(entityName)) {
        return "4_userland/" + entityName;
      }

      const transientEntities = ["Queue", "HEAD"];
      if (transientEntities.includes(entityName)) {
        return "5_transient/" + entityName;
      }

      return "X_rest/" + entityName;
    },
  });
  // console.log("dump", dump);
  // console.log("orm", orm);
  // await orm.close(true);
  return;
}

await generate();
Deno.exit();
