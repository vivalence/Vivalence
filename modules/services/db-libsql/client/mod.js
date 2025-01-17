import { createClient } from "../lib/db.js";

// where does this filePath variable come from on the client???????
// do i write an env var on boot?
// no... hmmm
// the client is called with ??? something different on the client as the service.
// interesting.

let client;

export default function createDatabaseClient(params) {
  console.log("createDatabaseClient", params);
  if (!client) {
    client = createClient(filePath);
  }

  return client;
}
