import client from "./client/mod.js";
import service from "./service/mod.js";

const manifest = {
  type: "service",
  slug: "identity",
  name: "Identity service. Provides user authentication, authorization and licencing. Works by - Entitlements to services, traits, strategies, and resources.",
};

export { manifest, client, service };
