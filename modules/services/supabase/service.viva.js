import client from "./client/mod.js";
import service from "./service/mod.js";

const manifest = {
  type: "service",
  slug: "supabase",
  name: "Local supabase client",
};

export { manifest, client, service };
