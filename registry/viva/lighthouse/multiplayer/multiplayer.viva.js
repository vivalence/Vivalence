import provider from "./provider/index.js";
import aperture from "./server/index.js";

const manifest = {
  type: "lighthouse",
  slug: "multiplayer",
  name: "Identity service. Provides users with identity, acceses, authentication and authorization.",
  traits: ["ATTACHED", "SERVICE", "DATAMAP", "SYSTEMMAP"],
};

export { manifest, provider, aperture };
