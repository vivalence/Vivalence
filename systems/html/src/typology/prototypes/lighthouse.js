import { map, atom, computed } from "nanostores";
import { Vector, shape, Connection, Url, shard } from "@vivalence/typology";
import { hydrate } from "./persistence.js";
import { boot as bootDaemon } from "./daemon.js";

export { hydrate } from "./persistence.js";

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

const lifecycle = new Vector()
  .use(async (ctx, next) => {
    ctx.boot = async (pojo) => {
      const url = new Url(pojo.url);
      const connection = new Connection(url)
        .use(shard.connection.authorize(ctx.entity.$authority))
        .use(shard.connection.batch({
          hatch: url,
          filter: (ctx) => ctx.request.headers.get("accept") !== "text/event-stream",
        }));
      return bootDaemon({ connection, lighthouse: ctx.entity });
    };
    await next();
  })

  .use(async (ctx, next) => {
    await next();
    if (!ctx.entity.$isAuthorized.get()) return;
    ctx.entity.manifest = await ctx.entity.connection.call("/manifest");
    const daemons = await ctx.entity.connection.call("/entities/daemon/find");
    await Promise.all(
      daemons.map(async (pojo) => {
        if (ctx.entity.daemons.has(pojo.slug)) return;
        const daemon = await ctx.boot(pojo);
        ctx.entity.daemons.set(daemon.slug, daemon);
      }),
    );
    ctx.entity.$daemons.set([...ctx.entity.daemons.values()]);
  })

  .use(async (ctx, next) => {
    await next();
    const result = await ctx.entity.verify();
    if (result.status === "OK" || result.status === "NETWORK_ERROR") {
      if (!ctx.entity.$isAuthorized.get()) throw new Error("Lighthouse unauthorized");
    }
  })

  .affect((ctx) => {
    ctx.entity = new Lighthouse(ctx.connection);
    hydrate(ctx.entity);
  });

export const create = shape.selbstbestimmt(lifecycle, (carry, effect) => async (connection) => {
  const ctx = { connection };
  await carry(ctx, async () => await effect(ctx));
  return ctx.entity;
});

export async function verifyAuth(lighthouse) {
  const result = await lighthouse.verify();
  if (result.status === "OK" || result.status === "NETWORK_ERROR") {
    if (!lighthouse.$isAuthorized.get()) throw new Error("Lighthouse unauthorized");
  }
  return result;
}

export async function boot(lighthouse) {
  await verifyAuth(lighthouse);
  if (!lighthouse.$isAuthorized.get()) return false;
  await populate(lighthouse);
  return true;
}

export async function populate(lighthouse) {
  if (lighthouse.daemons.size) return;

  const bootOneDaemon = async (pojo) => {
    const url = new Url(pojo.url);
    const connection = new Connection(url)
      .use(shard.connection.authorize(lighthouse.$authority))
      .use(shard.connection.batch({
        hatch: url,
        filter: (ctx) => ctx.request.headers.get("accept") !== "text/event-stream",
      }));
    return bootDaemon({ connection, lighthouse });
  };

  lighthouse.manifest = await lighthouse.connection.call("/manifest");
  const daemons = await lighthouse.connection.call("/entities/daemon/find");
  await Promise.all(
    daemons.map(async (pojo) => {
      if (lighthouse.daemons.has(pojo.slug)) return;
      const daemon = await bootOneDaemon(pojo);
      lighthouse.daemons.set(daemon.slug, daemon);
    }),
  );
  lighthouse.$daemons.set([...lighthouse.daemons.values()]);
}
