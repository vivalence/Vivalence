import { map, atom, computed } from "nanostores";
import { shard } from "@vivalence/typology";

export class Lighthouse {
  daemons = new Map();
  $daemons = atom([]);
  $authority = map({});
  $identity = map({});
  $status = atom({ code: "IDLE" });

  $isAuthorized = computed(this.$authority, (a) => !!a?.access && !!a?.refresh);
  $isIdentified = computed(this.$identity, (i) => !!i?.id);

  constructor(connection) {
    this.connection = connection
      .use(shard.connection.authorize(this.$authority))
      .use(shard.connection.retry({ maxRetries: 2 }))
      .use(shard.connection.timeout())
      .use(shard.connection.track(connection));
  }

  async login(username, password) {
    this.$status.set({ code: "AUTHENTICATING" });

    const response = await this.connection
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

    const response = await this.connection
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

    const response = await this.connection
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

  toJSON() {
    return {
      ...this.json,
      daemons: [...this.daemons.keys()],
    };
  }
}
