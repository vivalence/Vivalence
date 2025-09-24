import client from "./client.js";
import server from "./server.js";

const manifest = {
  type: "lighthouse",
  slug: "multiplayer",
  name: "Identity service. Provides users with identity, acceses, authentication and authorization.",
  traits: ["ATTACHED", "SERVICE", "DATAMAP", "SYSTEMMAP"],
};

export { manifest, client, server };
