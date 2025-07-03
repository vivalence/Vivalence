// import client from "./client/index.js";
import server from "./server/index.js";

const manifest = {
  type: "service",
  slug: "multiplayer",
  name: "Identity service. Provides user authentication, authorization and licencing. Works by - Entitlements to services, traits, strategies, and resources.",
  traits: ["IDENTITY", "ATTACHED"],
};

const users = server();

function client(service) {
  return {
    secure: function (claims) {
      return async function (ctx, next) {
        // const identity = ctx.identity.identity
        // validate(identity.authorizations, claims)
      };
    },
    authenticate: async function (token, repository) {
      // const identity = await findIdentity(token)
      // ctx.entities.user.ensure(identity)
      // if (!identity) throw new Error("AUTH ERROR");

      return {
        getUser() {
          return repository.findOne({ id: identity.id });
        },
      };
    },
  };
}

// Temporary proxy for server.
function attach(service, aperture) {
  aperture.open("/login", async (input, ctx) => {
    const { name, password } = input;
    const identity = findIdentity({ name, password });
    const token = makeToken(identity);
    return token;
  });
}

// function control(service, host) {
//   host.trajectory.open("/create", (ctx) => ({}));
// }

export { manifest, client, attach };
