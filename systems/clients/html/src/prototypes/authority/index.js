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

// auth.authority.use(async (ctx, next) => {
//   await next();
//   if (ctx.response.status === 401) {
//     const refresh = await auth.refresh();
//     if (refresh.valid && !ctx.state.isRetry) await ctx.request.retry();
//   }
// });

// auth.store.identity.subscribe((identity) => {
//   if (identity) {
//     identity.shards.runtimes.map((shard) => shard.withAuth(auth));
//     user.withIdentity(identity);
//   }
// });

// for (const shard of identity?.shards.runtimes) {
// shard.withAuth(auth);
// user.shards.runtimes.push(shard.withAuth(auth));
// user.shards.runtimes.push(shard.withAuth(auth));
// console.log(await shard.call("/status"));
// }
