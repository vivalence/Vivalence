import { createClient } from "../lib/db.js";

let client;

export default function createDatabaseClient(service, ctx) {
  if (!client) {
    client = createClient(service.config);
  }

  return client;
}
