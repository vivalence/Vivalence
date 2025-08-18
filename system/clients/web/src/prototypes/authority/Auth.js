import { get } from "svelte/store";
import * as store from "./stores.svelte.js";

export class Authority {
  store = store;
  constructor(lighthouse) {
    this.lighthouse = lighthouse;
  }

  async login(username, password) {
    const { token, identity, error } = await this.lighthouse.call(
      "/auth/login",
      { username, password },
    );

    if (!error) {
      this.store.token.set(token);
      this.store.identity.set(identity);
      return this.identity;
    } else {
      console.log("LOGIN ERROR", error);
    }
  }

  async verify() {
    const { valid, error } = await this.lighthouse.call("/auth/verify", {
      access: this.token.access,
    });
    // console.log("/verify", { valid, error });

    if (!valid) {
      return await this.refresh();
    }

    return { valid };
  }

  async refresh() {
    const { access, error } = await this.lighthouse.call("/auth/refresh", {
      refresh: this.token.refresh,
    });

    if (access) {
      this.store.token.update((token) => ({ ...token, access }));
      return { valid: true };
    } else {
      this.logout();
      return { valid: false };
    }
  }
  logout() {
    this.store.token.set(null);
    this.store.identity.set(null);
  }
  get token() {
    return get(this.store.token);
  }
  get identity() {
    return get(this.store.identity);
  }
  get isIdentified() {
    return !!this.identity;
  }
}
