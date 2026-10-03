import provider from "./provider/index.js";
import { attachment } from "./attachment/index.js";

const manifest = {
  type: "lighthouse",
  slug: "multiplayer",
  name: "Identity service. Provides users with identity, acceses, authentication and authorization.",
  traits: ["SERVICE", "PROVIDER", "DATAMAP", "ATTACHED"],
};

export { attachment, manifest, provider };
