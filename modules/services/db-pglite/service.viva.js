import client from "./client/mod.js";

const manifest = {
  type: "service",
  slug: "pglite",
  name: "pglite (Postgres) Database",
};

export { manifest, client };
