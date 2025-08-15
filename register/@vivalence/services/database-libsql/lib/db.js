import { join } from "@std/path";
import * as libsql from "@libsql/client/node";

export const createClient = (service) => {
  let path = join(service.data, service.config.db.path);
  service.config.path = path;

  if (!path.startsWith("file:")) {
    path = `file:` + path;
  }

  const db = libsql.createClient({ url: path });
  return db;
};
