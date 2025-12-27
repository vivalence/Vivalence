import { map, atom, computed } from "nanostores";
import { shards } from "@vivalence/html/typology";

export class Lighthouse {
  daemons = new Set();
  $authority = map({});
  $identity = map({});

  $isAuthorized = computed(this.$authority, (a) => !!a?.access && !!a.refresh);
  $isIdentified = computed(this.$identity, (i) => !!i?.id);
  // network / gaia / [services runtimes]

  constructor(connection) {
    this.connection = connection //
      .use(shards.connection.authorize(this.$authority));
  }
  get json() {
    return {
      isIdentified: this.$isIdentified.get(),
      isAuthorized: this.$isAuthorized.get(),
      identity: this.$identity.get(),
      authority: this.$authority.get(),
    };
  }

  async login(username, password) {
    // TODO IMPORTANT CHORE: implement @typology/status
    const { authority, identity } = await this.connection.call("/auth/login", {
      username,
      password,
    });
    if (authority) this.$authority.set(authority);
    if (identity) this.$identity.set(identity);
  }

  async verify() {
    const auth = this.$authority.get();
    // console.log("lighthouse @verify", this.json);
    if (!auth?.access) return { success: false };

    const response = await this.connection.fetch("/auth/verify", {
      access: auth.access,
    });

    if (response.status === 401) {
      const refresh = await this.refresh();
      return refresh;
    }
    if (response.body.success) return { success: true };

    // if status is another error but unauthorized ...?
    console.log("@UNHANDLED VERIFIED CASE @lighthouse/prototype/verify");
    // await lighthouse.logout();
  }

  async refresh() {
    const auth = this.$authority.get();
    if (!auth?.refresh) return { valid: false };
    const response = await this.connection.fetch("/auth/refresh", {
      refresh: auth.refresh,
    });
    if (response.status === 401) {
      this.logout();
      return { success: false };
    }
    // ... handle literally all other errors

    const result = response.body;
    if (result.access) this.$authority.set({ ...auth, access: result.access });
    if (result.success === false) {
      console.log("[refresh failure]", this, { auth, result });
      this.logout();
    }
    return { success: !!result.access };
  }

  logout() {
    const auth = this.$authority.get();
    this.$authority.set(null);
    this.$identity.set(null);
    if (auth?.refresh)
      this.connection.call("/auth/logout", { refresh: auth.refresh });
  }
}
