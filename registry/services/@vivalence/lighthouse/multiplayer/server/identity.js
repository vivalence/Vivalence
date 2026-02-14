import hash from "@vivalence/shared/hash";

export function inject() {
  return async (ctx, next) => {
    ctx.identity = {
      findOne: async (where, options) => {
        return ctx.entities.identity.findOne(where, options);
      },

      identify: async ({ username, password }) => {
        if (!username || !password) return null;

        const identity = await ctx.entities.identity
          .createQueryBuilder("i")
          .where(
            `json_extract(i.authentication, '$.credentials.username') = ?`,
            [username],
          )
          .getSingleResult();

        if (!identity?.authentication?.credentials?.password) return null;

        const valid =
          identity.authentication.credentials.password ===
          hash.string(password);

        return valid ? identity : null;
      },
    };

    await next();
  };
}

// export function inject() {
//   return async (ctx, next) => {
//     ctx.identity = {
//       findOne: async function (where, options) {
//         const identity = await ctx.entities.identity.findOne(where, options);
//         return identity;
//       },
//       identify: async function (credentials) {
//         if (credentials.username && credentials.password) {
//           const passwordHash = hash.string(credentials.password);

//           const identities = await ctx.entities.identity //
//             .find({});

//           const identity = identities.find((identity) => {
//             return (
//               identity.authentication.credentials.username ===
//                 credentials.username &&
//               identity.authentication.credentials.password === passwordHash
//             );
//           });

//           return identity;
//         }
//         return null;
//       },
//     };

//     await next();
//   };
// }

// export const list = [
//   {
//     id: "localhost",
//     slug: "beef",
//     username: "beef",
//     password: hash.string("biggusdickus"),
//     shards: [
//       {
//         type: "daemon",
//         slug: "eng2lat",
//         url: "http://localhost:5175/daemon/eng2lat",
//       },
//     ],
//   },
// ];
