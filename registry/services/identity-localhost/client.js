// config must contain information about how to reach the service server.

export default async function identity(config) {
  return {
    async getIdentity() {
      return {
        id: "localhost",
        roles: ["ADMIN"],
        shards: ["@daemon/identity", "@eng2lat/identity"],
      };
    },
  };
}
