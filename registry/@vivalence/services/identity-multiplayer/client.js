import createJWT from "./lib/jwt.js";
import identities from "./lib/identities.js";

export default async function client(service) {
  const { jwt } = await createJWT(service);

  return {
    authenticate: async function (token, repository) {
      const payload = await jwt.verify(token);
      if (!payload) throw new Error("Invalid or expired token");

      const identity = identities.findOne({ id: payload.id });
      if (!identity) throw new Error("Identity not found");

      const user = await repository.findOne({ id: identity.id });
      if (!user) {
        repository.create({ id: identity.id });
        await repository.em.flush();
      }

      return {
        identity,
        async getUser() {
          const user = await repository.findOne({ id: identity.id });
          return user;
        },
      };
    },
  };
}
