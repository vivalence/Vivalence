import client from "./client/mod.js";
import service from "./service/mod.js";

const manifest = {
  type: "service",
  slug: "libsql",
  name: "libsql Database",
};

export { manifest, client, service };
