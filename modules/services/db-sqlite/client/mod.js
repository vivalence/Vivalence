import config from "@vivalence/config";
import { Database } from "@db/sqlite";

let client;

export default function createDBClient() {
  if (!client) {
    const { DATABASE_PATH } = config.env;

    if (!DATABASE_PATH) {
      throw new Error("Missing database configuration. Please check your .env file.");
    }

    console.log(DATABASE_PATH);

    const db = new Database(DATABASE_PATH);

    db.exec("pragma journal_mode = WAL");
    db.exec("pragma synchronous = normal");
    db.exec("pragma temp_store = memory");

    client = db;
  }

  return client;
}

// db.prepare(
//   `
// 	CREATE TABLE IF NOT EXISTS people (
// 	  id INTEGER PRIMARY KEY AUTOINCREMENT,
// 	  name TEXT,
// 	  age INTEGER
// 	);
//   `,
// ).run();

// db.prepare(
//   `
// 	INSERT INTO people (name, age) VALUES (?, ?);
//   `,
// ).run("Bob", 40);

// const rows = db.prepare("SELECT id, name, age FROM people").all();
// console.log("People:");

// for (const row of rows) {
//   console.log(row);
// }
// db.close();
