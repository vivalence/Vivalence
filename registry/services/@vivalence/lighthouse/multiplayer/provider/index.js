import { Connection } from "@vivalence/typology";

export default async function authority(lighthouse, users) {
  const connection = new Connection(lighthouse.statics.remote);
  const verify = createVerifier(connection);

  return {
    authenticate: async (token) => {
      if (!token) {
        throw new Error("Token required");
      }

      const result = await verify(token);

      if (result.status === "ERROR") {
        const error = new Error(result.error.message);
        error.code = result.error.code;
        throw error;
      }

      const { identity } = result;

      if (!identity?.id) {
        throw new Error("Identity not found in token");
      }

      let user = await users.findOne({ id: identity.id });

      if (!user) {
        user = users.create({ id: identity.id });
        await users.em.flush();
      }

      return {
        identity,
        async getUser() {
          return users.findOne({ id: identity.id });
        },
      };
    },
  };
}

function createVerifier(connection) {
  return async (token) => {
    try {
      const response = await connection.fetch(
        "/auth/verify",
        { access: token },
        { method: "POST" },
      );

      if (!response.ok) {
        return response.body?.status === "ERROR"
          ? response.body
          : {
              status: "ERROR",
              error: { code: "VERIFY_FAILED", message: "Verification failed" },
            };
      }

      return response.body;
    } catch (error) {
      return {
        status: "ERROR",
        error: { code: "NETWORK_ERROR", message: error.message },
      };
    }
  };
}
// import { Connection } from "@vivalence/typology";

// export default async function authority(lighthouse, users) {
//   const verify = await createVerifier(lighthouse);

//   return {
//     authenticate: async function (token) {
//       const { valid, identity, error } = await verify(token);
//       if (error) throw error;
//       if (!valid) throw new Error("Invalid or expired token");
//       if (!identity) throw new Error("Identity not found");

//       let user = await users.findOne({ id: identity.id });
//       if (!user) {
//         user = users.create({ id: identity.id });
//         await users.em.flush();
//       }

//       return {
//         // identity,
//         async getUser() {
//           const user = await users.findOne({ id: identity.id });
//           return user;
//         },
//       };
//     },
//   };
// }

// async function createVerifier(service) {
//   return async (token) => {
//     try {
//       const connection = new Connection(service.statics.remote);
//       const response = await connection.fetch(
//         "/auth/verify",
//         { access: token },
//         { method: "POST" },
//       );

//       if (!response.ok) return { valid: false };
//       return { valid: true, ...response.body };
//     } catch (error) {
//       return { valid: false, error };
//     }
//   };
// }

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
