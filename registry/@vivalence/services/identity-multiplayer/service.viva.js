import client from "./client.js";
import server from "./server.js";

const manifest = {
  type: "service",
  slug: "multiplayer",
  name: "Identity service. Provides user authentication, authorization and licencing. Works by - Entitlements to services, traits, strategies, and resources.",
  traits: ["IDENTITY", "ATTACHED"],
};

export { manifest, client, server };
