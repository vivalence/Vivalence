import provider from "./client/runtime.js";
import service from "./server/index.js";

const manifest = {
  type: "gaia",
  slug: "multiplayer",
  name: "Identity service. Provides users with identity, acceses, authentication and authorization.",
  traits: ["ATTACHED", "SERVICE", "DATAMAP", "SYSTEMMAP"],
};

export { manifest, provider, service };
