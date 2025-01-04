import config from "@vivalence/config";
import { PGlite } from "@electric-sql/pglite";

let client;

export default async function createDBClient() {
  if (!client) {
    const { DATABASE_PATH } = config.env;

    if (!DATABASE_PATH) {
      throw new Error("Missing database configuration. Please check your .env file.");
    }

    console.log(DATABASE_PATH);

    const db = new PGlite(DATABASE_PATH);
    console.log(await db.query("select version();"));
    // -> { rows: [ { message: "Hello world" } ] }

    client = db;
  }

  return client;
}
