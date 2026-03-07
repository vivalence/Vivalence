import { map, atom, computed } from "nanostores";
import { shards } from "@vivalence/typology";

export class Lighthouse {
  daemons = new Set();
  $authority = map({});
  $identity = map({});
  $status = atom({ code: "IDLE" });

  $isAuthorized = computed(this.$authority, (a) => !!a?.access && !!a?.refresh);
  $isIdentified = computed(this.$identity, (i) => !!i?.id);

  constructor(connection) {
    this.connection = connection
      .use(shards.connection.authorize(this.$authority))
      .use(shards.connection.retry({ maxRetries: 2 }))
      .use(shards.connection.timeout())
      .use(shards.connection.track(connection));
  }

  async login(username, password) {
    this.$status.set({ code: "AUTHENTICATING" });

    const response = await this.connection //
      .fetch("/auth/login", { username, password });

    if (response.error) {
      this.$status.set({
        code: "ERROR",
        message: response.error.message,
        type: response.error.type,
      });
      return { status: "ERROR", error: response.error };
    }

    const { authority, identity } = response.body;
    if (authority) this.$authority.set(authority);
    if (identity) this.$identity.set(identity);

    this.$status.set({ code: "AUTHENTICATED" });
    return { status: "OK", identity };
  }

  async verify() {
    const auth = this.$authority.get();
    if (!auth?.access) {
      return { status: "NO_TOKEN" };
    }

    this.$status.set({ code: "VERIFYING" });

    const response = await this.connection //
      .fetch("/auth/verify", { access: auth.access });

    if (response.isNetworkError) {
      this.$status.set({
        code: "OFFLINE",
        message: "Network unavailable",
        canRetry: true,
      });
      return { status: "NETWORK_ERROR", canRetry: true };
    }

    if (response.isAuthError) {
      const refreshResult = await this.refresh();
      return refreshResult;
    }

    if (response.error) {
      this.$status.set({ code: "ERROR", message: response.error.message });
      return { status: "ERROR", error: response.error };
    }

    if (response.body.status === "SUCCESS") {
      this.$status.set({ code: "VERIFIED" });
      return { status: "OK" };
    }

    return { status: "INVALID" };
  }

  async refresh() {
    const auth = this.$authority.get();
    if (!auth?.refresh) {
      return { status: "NO_REFRESH_TOKEN" };
    }

    this.$status.set({ code: "REFRESHING" });

    const response = await this.connection //
      .fetch("/auth/refresh", { refresh: auth.refresh });

    if (response.isNetworkError) {
      this.$status.set({
        code: "OFFLINE",
        message: "Network unavailable",
        canRetry: true,
      });
      return { status: "NETWORK_ERROR", canRetry: true };
    }

    if (response.isAuthError) {
      this.logout();
      this.$status.set({ code: "SESSION_EXPIRED" });
      return { status: "SESSION_EXPIRED" };
    }

    if (response.error) {
      this.logout();
      this.$status.set({ code: "ERROR", message: response.error.message });
      return { status: "ERROR", error: response.error };
    }

    const { access } = response.body;
    if (access) {
      this.$authority.set({ ...auth, access });
      this.$status.set({ code: "REFRESHED" });
      return { status: "OK" };
    }

    this.logout();
    return { status: "REFRESH_FAILED" };
  }

  logout() {
    const auth = this.$authority.get();
    this.$authority.set(null);
    this.$identity.set(null);
    this.$status.set({ code: "LOGGED_OUT" });

    if (auth?.refresh) {
      this.connection.fetch("/auth/logout", { refresh: auth.refresh }).catch(() => {});
    }
  }
  get json() {
    return {
      status: this.$status.get(),
      isIdentified: this.$isIdentified.get(),
      isAuthorized: this.$isAuthorized.get(),
      identity: this.$identity.get(),
      authority: this.$authority.get(),
    };
  }
}
// import { map, atom, computed } from "nanostores";
// import { shards } from "@vivalence/html/typology";

// export class Lighthouse {
//   daemons = new Set();
//   $authority = map({});
//   $identity = map({});

//   $isAuthorized = computed(this.$authority, (a) => !!a?.access && !!a.refresh);
//   $isIdentified = computed(this.$identity, (i) => !!i?.id);
//   // network / gaia / [services runtimes]

//   constructor(connection) {
//     this.connection = connection //
//       .use(shards.connection.authorize(this.$authority));
//   }
//   get json() {
//     return {
//       isIdentified: this.$isIdentified.get(),
//       isAuthorized: this.$isAuthorized.get(),
//       identity: this.$identity.get(),
//       authority: this.$authority.get(),
//     };
//   }

//   async login(username, password) {
//     const { authority, identity } = await this.connection.call("/auth/login", {
//       username,
//       password,
//     });
//     if (authority) this.$authority.set(authority);
//     if (identity) this.$identity.set(identity);
//   }

//   async verify() {
//     const auth = this.$authority.get();
//     if (!auth?.access) return { success: false };

//     console.log("lighthouse @verify", this.json);
//     const response = await this.connection.fetch("/auth/verify", {
//       access: auth.access,
//     });

//     console.log("verify", { response });
//     if (response.status === 401) {
//       const refresh = await this.refresh();
//       return refresh;
//     }
//     if (response.body.success) return { success: true };

//     // if status is another error but unauthorized ...?
//     console.log("@UNHANDLED VERIFIED CASE @lighthouse/prototype/verify");
//     // await lighthouse.logout();
//   }

//   async refresh() {
//     const auth = this.$authority.get();
//     if (!auth?.refresh) return { valid: false };
//     const response = await this.connection.fetch("/auth/refresh", {
//       refresh: auth.refresh,
//     });
//     console.log("refresh", { response });
//     if (response.status === 401) {
//       this.logout();
//       return { success: false };
//     }
//     // ... handle literally all other errors

//     const result = response.body;
//     if (result.access) this.$authority.set({ ...auth, access: result.access });
//     if (result.success === false) {
//       console.log("[refresh failure]", this, { auth, result });
//       this.logout();
//     }
//     return { success: !!result.access };
//   }

//   logout() {
//     const auth = this.$authority.get();
//     this.$authority.set(null);
//     this.$identity.set(null);
//     if (auth?.refresh)
//       this.connection.call("/auth/logout", { refresh: auth.refresh });
//   }
// }
