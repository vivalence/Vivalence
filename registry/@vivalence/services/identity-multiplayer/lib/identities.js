import hash from "@vivalence/shared/hash";

export const identities = [
  {
    id: "localhost",
    roles: ["ADMIN"],
    username: "finn",
    password: hash.string("biggusdickus"),
    shards: {
      runtimes: [
        {
          slug: "eng2lat",
          url: "http://localhost:5175/runtime/eng2lat",
        },
      ],
    },
  },
];

export function identify(credentials) {
  if (credentials.username && credentials.password) {
    const passwordHash = hash.string(credentials.password);
    return identities.find(
      (id) =>
        id.username === credentials.username && id.password === passwordHash,
    );
  }
  return null;
}

export function findOne(query) {
  return identities.find((identity) => query.id === identity.id);
}

export default { identify, findOne };
