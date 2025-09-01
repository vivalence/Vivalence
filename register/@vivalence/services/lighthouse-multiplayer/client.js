export default async function client(service, users) {
  const verify = await createVerifier(service);

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
        identity,
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
      const response = await fetch(
        service.config.authority.url + "/auth/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ access: token }),
        },
      );

      if (!response.ok) {
        return { valid: false };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return { valid: false, error };
    }
  };
}
