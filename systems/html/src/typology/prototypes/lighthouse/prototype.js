import { shards } from "@vivalence/html/typology";
import { map, atom, computed } from "nanostores";

export class Lighthouse {
  $authority = map({});
  $identity = map({});

  isAuthorized = computed(this.$authority, (a) => !!a?.access && !!a.refresh);
  isIdentified = computed(this.$identity, (i) => !!i?.id);
  // network / gaia / [services runtimes]

  constructor(connection) {
    this.connection = connection;

    this.connection //
      .use(shards.connection.backstop(this))
      .use(shards.connection.authorize(this.$authority));
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
    return auth?.access
      ? this.connection.call("/auth/verify", { access: auth.access })
      : { success: false };
  }

  async refresh() {
    const auth = this.$authority.get();
    if (!auth?.refresh) return { valid: false };
    const result = await this.connection.call("/auth/refresh", {
      refresh: auth.refresh,
    });
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
