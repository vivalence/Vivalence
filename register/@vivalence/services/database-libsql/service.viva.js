import { createClient } from "./lib/db.js";

const manifest = {
  type: "service",
  slug: "libsql",
  name: "libsql Database",
  traits: ["DATABASE"],
};

function client(service) {
  return createClient(service);
}

function control(service, host) {
  console.log("libsql control", service);
  host.trajectory.open("/create", async () => {
    // todo ensure dir
    const db = createClient({ ...service.config, ...service.secret });

    await db.execute("PRAGMA journal_mode = WAL;");
    await db.execute("PRAGMA busy_timeout = 5000;");
    await db.execute("PRAGMA synchronous = NORMAL;");
    await db.execute("PRAGMA cache_size = 2000;");
    await db.execute("PRAGMA temp_store = MEMORY;");
    await db.execute("PRAGMA foreign_keys = true;");

    await db.close();
  });
}

export { manifest, client, control };
