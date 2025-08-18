import hash from "@vivalence/shared/hash";

export const identities = [
  {
    id: "localhost",
    username: "beef",
    slug: "beef",
    password: hash.string("biggusdickus"),
    shards: [
      {
        // daemon: "localhost",
        type: "runtime", // some composite key;
        runtime: "eng2lat", // some composite key;
        url: "http://localhost:5175/runtime/eng2lat", // ? computed?
      },
    ],
  },
];

export function identify(credentials) {
  if (credentials.username && credentials.password) {
    const passwordHash = hash.string(credentials.password);
    console.log(credentials, passwordHash, identities);
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
