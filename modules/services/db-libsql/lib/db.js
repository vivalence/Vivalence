import config from "@vivalence/config";
import { dirname } from "@std/path";
import * as libsql from "@libsql/client/node";

export const createClient = (config) => {
  const { filePath } = valid(config);
  const db = libsql.createClient({ url: filePath });
  return db;
};

export const createDatabase = async (config) => {
  await Deno.mkdir(dirname(config.filePath), { recursive: true });
  const { filePath } = valid(config);

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
