import hash from "@vivalence/shared/hash";

export function inject() {
  return async (ctx, next) => {
    ctx.identity = {
      findOne: async function (query) {
        const identity = await ctx.entities.identity //
          .findOne(query, { populate: ["runtimes"] });
        return identity;
      },
      identify: async function (credentials) {
        if (credentials.username && credentials.password) {
          const passwordHash = hash.string(credentials.password);

          const identities = await ctx.entities.identity //
            .find({}, { populate: ["runtimes"] });

          const identity = identities.find((identity) => {
            return (
              identity.authentication.credentials.username ===
                credentials.username &&
              identity.authentication.credentials.password === passwordHash
            );
          });

          return identity;
        }
        return null;
      },
    };

    await next();
  };
}

// export const list = [
//   {
//     id: "localhost",
//     slug: "beef",
//     username: "beef",
//     password: hash.string("biggusdickus"),
//     shards: [
//       {
//         type: "runtime",
//         slug: "eng2lat",
//         url: "http://localhost:5175/runtime/eng2lat",
//       },
//     ],
//   },
// ];
