import { Service, Runtime } from "./prototypes.js";

const authority = {
  token: JSON.parse(localStorage.getItem("viva_token") || "null"),
  identity: JSON.parse(localStorage.getItem("viva_identity") || "null"),

  set(token, identity) {
    this.token = token;
    this.identity = identity;
    localStorage.setItem("viva_token", JSON.stringify(token));
    localStorage.setItem("viva_identity", JSON.stringify(identity));
  },

  clear() {
    this.token = null;
    this.identity = null;
    localStorage.removeItem("viva_token");
    localStorage.removeItem("viva_identity");
  },
};

// Create lighthouse service
const lighthouse = new Service(
  import.meta.env.VITE_LIGHTHOUSE_URL || "http://localhost:3000",
);

await lighthouse.handshake();

const discoverRuntimes = async (lighthouse, authority) => {
  const runtimes = new Map();

  const shards = await lighthouse.repository("shard").findMany();

  for (const shard of shards) {
    if (!runtimes.has(shard.slug)) {
      const runtime = new Runtime(shard, authority);
      await runtime.handshake();
      runtimes.set(shard.slug, runtime);
      console.log(`Runtime ${shard.slug} connected:`, runtime.status);
    }
  }

  return runtimes;
};
