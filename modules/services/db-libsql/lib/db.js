// import config from "@vivalence/config";
import * as path from "@std/path";
import * as fs from "@std/fs";
import * as libsql from "@libsql/client/node";

export const createClient = (config) => {
  const { filePath } = valid(config);
  const db = libsql.createClient({ url: filePath });
  return db;
};

export const createDatabase = async (config) => {
  const { filePath } = valid(config);
  await fs.ensureDir(path.dirname(filePath));

  const db = libsql.createClient({ url: filePath });

  await db.execute("PRAGMA journal_mode = WAL;");
  await db.execute("PRAGMA busy_timeout = 5000;");
  await db.execute("PRAGMA synchronous = NORMAL;");
  await db.execute("PRAGMA cache_size = 2000;");
  await db.execute("PRAGMA temp_store = MEMORY;");
  await db.execute("PRAGMA foreign_keys = true;");

  return db;
};

export function valid(config) {
  let { filePath } = config;

  if (!filePath.startsWith("file:")) {
    filePath = `file:` + filePath;
  }

  if (!filePath) {
    throw new Error("[libsql] no database service defined");
  }

  return { filePath };
}
