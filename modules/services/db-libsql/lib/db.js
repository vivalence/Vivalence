import * as libsql from "@libsql/client/node";

export const createClient = (databasePath) => {
  const db = libsql.createClient({ url: databasePath });
  return db;
};

export const createDatabase = async (databasePath) => {
  const db = libsql.createClient({ url: databasePath });

  await db.execute("PRAGMA journal_mode = WAL;");
  await db.execute("PRAGMA busy_timeout = 5000;");
  await db.execute("PRAGMA synchronous = NORMAL;");
  await db.execute("PRAGMA cache_size = 2000;");
  await db.execute("PRAGMA temp_store = MEMORY;");
  await db.execute("PRAGMA foreign_keys = true;");

  return db;
};
