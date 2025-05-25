import client from "./client/mod.js";
import { createDatabase } from "./lib/db.js";

const manifest = {
  type: "service",
  slug: "libsql",
  name: "libsql Database",
};

function boot(host, service) {
  host.trajectory.open(
    (p) => p.sig("/create"),
    async () => {
      const db = await createDatabase(service.config);
      await db.close();
    },
  );
}

export { manifest, client, boot };
