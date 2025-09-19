import { atom, computed } from "nanostores";
import { Call } from "./call/call.js";

const track = (connection) => async (ctx, next) => {
  try {
    connection.setActive();
    await next();
    connection.setHealthy();
  } catch (error) {
    connection.setFaulty(error);
    throw error;
  }
};

const authorize = ($authority) => async (ctx, next) => {
  const auth = $authority.get();
  if (auth?.access) {
    ctx.request.headers.Authorization = `Bearer ${auth.access}`;
  }
  await next();
};

//

export class Lighthouse {
  $authority = atom(null);
  $identity = atom(null);

  constructor(connection) {
    this.connection = connection;

    this.call = new Call(this.connection.url)
      .use(track(this.connection))
      .use(authorize(this.$authority));

    // this.$authority.subscribe((authority) => {
    this.isAuthorized.subscribe((authorized) => {
      // if (authorized && !this.$identity.get())
      // authority = this.$authority.get()
      // pull = this.$identity.set(result.identity);
      // if (authority) once(// pull);
      // if (authority && !idenity) {// pull}
    });
  }

  async login(username, password) {
    const authority = await this.call("/auth/login", { username, password });
    if (authority) this.$authority.set(authority);
    return authority;
  }

  async verify() {
    const auth = this.$authority.get();
    return auth?.access
      ? this.call("/auth/verify", { access: auth.access })
      : { valid: false };
  }

  async refresh() {
    const auth = this.$authority.get();
    if (!auth?.refresh) return { valid: false };
    const result = await this.call("/auth/refresh", { refresh: auth.refresh });
    if (result.access) this.$authority.set({ ...auth, access: result.access });
    return { valid: !!result.access };
  }

  logout() {
    const auth = this.$authority.get();
    if (auth?.refresh) this.call("/auth/logout", { refresh: auth.refresh });
    this.$authority.set(null);
    this.$identity.set(null);
  }

  isAuthorized = computed(this.$authority, (a) => !!a?.access);
  isIdentified = computed(this.$identity, (i) => !!i);
}
