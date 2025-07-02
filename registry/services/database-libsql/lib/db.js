import * as libsql from "@libsql/client/node";

export const createClient = (config) => {
  const filePath = valid(config);
  const db = libsql.createClient({ url: filePath });
  return db;
};

export function valid(config) {
  const { db } = config;

  let path = db.path;

  if (!path.startsWith("file:")) {
    path = `file:` + path;
  }

  if (!path) {
    throw new Error("[libsql] no database service defined");
  }
  return path;
}
