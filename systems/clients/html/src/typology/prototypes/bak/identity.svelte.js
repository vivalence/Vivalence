export function createIdentity(lighthouse) {
  let identity = $state({});

  return {
    identity,

    set(data) {
      identity = data;
    },

    clear() {
      identity = null;
    },
  };
}

// get identity() {
//   return identity;
// },
// get id() {
//   return identity?.id;
// },
// get slug() {
//   return identity?.slug;
// },
// get runtimes() {
//   return identity?.runtimes || [];
// },
// get isIdentified() {
//   return !!identity;
// },
