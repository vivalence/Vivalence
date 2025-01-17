import { defineConfig } from "@mikro-orm/sqlite";
import { EntityGenerator } from "@mikro-orm/entity-generator";

export default defineConfig({
  multipleStatements: true,
  extensions: [EntityGenerator],
  discovery: { warnWhenNoEntities: false },

  dbName: "/Users/finn/vivalence/code/vivalence/viva.db",

  // enable debug mode to log SQL queries and discovery information
  debug: true,
});
