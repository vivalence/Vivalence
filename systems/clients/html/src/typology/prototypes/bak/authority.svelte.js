export function createAuthority(lighthouse) {
  let tokens = $state(null);

  return {
    authority,

    set(tokens) {
      authority = tokens;
    },

    update(updater) {
      authority = updater(authority);
    },

    clear() {
      authority = null;
    },

    updateAccess(access) {
      if (authority) {
        authority = { ...authority, access };
      }
    },
  };
}

// get access() {
//   return authority?.access;
// },
// get refresh() {
//   return authority?.refresh;
// },
// get isAuthorized() {
//   return !!authority?.access;
// },
