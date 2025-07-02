export default async function identity() {
  return {
    seed: [
      {
        id: "localhost",
        roles: ["ADMIN"],
      },
    ],
    async getUser() {
      return {
        id: "localhost",
        roles: ["ADMIN"],
      };
    },
  };
}
