import { Connection } from "@vivalence/typology";

export default async function authority(lighthouse, users) {
  const verify = await createVerifier(lighthouse);

  return {
    authenticate: async function (token) {
      const { valid, identity, error } = await verify(token);
      if (error) throw error;
      if (!valid) throw new Error("Invalid or expired token");
      if (!identity) throw new Error("Identity not found");

      let user = await users.findOne({ id: identity.id });
      if (!user) {
        user = users.create({ id: identity.id });
        await users.em.flush();
      }

      return {
        // identity,
        async getUser() {
          const user = await users.findOne({ id: identity.id });
          return user;
        },
      };
    },
  };
}

async function createVerifier(service) {
  return async (token) => {
    try {
      const connection = new Connection(service.statics.remote);
      const response = await connection.fetch(
        "/auth/verify",
        { access: token },
        { method: "POST" },
      );

      if (!response.ok) return { valid: false };
      return { valid: true, ...response.body };
    } catch (error) {
      return { valid: false, error };
    }
  };
}

// const response = await fetch(
//   // service.statics.remote.branch("/auth/verify"),
//   {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ access: token }),
//   },
// );
