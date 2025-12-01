import { map, atom, computed } from "nanostores";
import { Call } from "$client/typology";

const authorize = ($authority) => async (ctx, next) => {
  const auth = $authority.get();
  if (auth?.access) {
    ctx.request.headers.Authorization = `Bearer ${auth.access}`;
  }
  await next();
  // if(ctx.response.error === auth){
  //   await lighthouse.refresh();
  //   await ctx.retry()
  // }
};

const backstop = (lighthouse) => async (ctx, next) => {
  await next();
  // if(ctx.response.error === auth){
  //   await lighthouse.logout();
  // }
};

export class Lighthouse {
  $authority = map({});
  $identity = map({});

  isAuthorized = computed(this.$authority, (a) => !!a?.access && !!a.refresh);
  isIdentified = computed(this.$identity, (i) => !!i?.id);
  // network / gaia / [services runtimes]

  constructor(connection) {
    this.connection = connection;

    this.call = new Call(this.connection)
      .use(backstop(this))
      .use(authorize(this.$authority));
  }

  async login(username, password) {
    // TODO IMPORTANT CHORE: implement @typology/status
    const { authority, identity } = await this.call("/auth/login", {
      username,
      password,
    });
    if (authority) this.$authority.set(authority);
    if (identity) this.$identity.set(identity);
  }

  async verify() {
    const auth = this.$authority.get();
    return auth?.access
      ? this.call("/auth/verify", { access: auth.access })
      : { success: false };
  }

  async refresh() {
    const auth = this.$authority.get();
    if (!auth?.refresh) return { valid: false };
    const result = await this.call("/auth/refresh", { refresh: auth.refresh });
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
    if (auth?.refresh) this.call("/auth/logout", { refresh: auth.refresh });
  }
}
