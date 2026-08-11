import { map, atom, computed, effect } from "nanostores";
import { shard } from "@vivalence/typology";
import { logger } from "$telemetry";
import { Dataspace } from "../prototypes/dataspace.js";
import { DaemonDossier } from "../entities/daemon/index.js";

const STORAGE_KEY = (url) => `lighthouse:${url}`;

export class Lighthouse {
  $authority = map({});
  $identity = map({});
  $status = atom({ code: "IDLE" });

  $isAuthorized = computed(this.$authority, (a) => !!a?.access && !!a?.refresh);
  $isIdentified = computed(this.$identity, (i) => !!i?.id);

  $daemons = atom([]);
  manifest = null;

  get authority() {
    return this.$authority.get();
  }
  get identity() {
    return this.$identity.get();
  }
  get status() {
    return this.$status.get();
  }
  get isAuthorized() {
    return this.$isAuthorized.get();
  }
  get isIdentified() {
    return this.$isIdentified.get();
  }

  // get daemons() {return this.dataspace.daemon;}

  constructor(connection, { channel = null } = {}) {
    this.channel = channel;
    this.connection = connection
      .use(shard.track.request())
      .use(shard.track.fault())
      .use(shard.connection.authorize(this.$authority))
      .use(shard.connection.timeout())
      .use(shard.connection.track(connection));

    this.dataspace = new Dataspace({
      entities: [DaemonDossier],
      connection: this.connection,
      seed: seedLighthouse(this),
    });
  }

  async login(username, password) {
    this.$status.set({ code: "AUTHENTICATING" });

    const response = await this.connection.fetch("/auth/login", { username, password });

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

    const response = await this.connection.fetch("/auth/verify", { access: auth.access });

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

    const response = await this.connection.fetch("/auth/refresh", { refresh: auth.refresh });

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
      daemons: this.$daemons.get().map((daemon) => daemon.slug),
    };
  }
}

export function hydrate(lighthouse) {
  const hydration = logger.entry("authority").open();
  const key = STORAGE_KEY(lighthouse.connection.url);
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      const { authority, identity } = JSON.parse(stored);
      if (authority) lighthouse.$authority.set(authority);
      if (identity) lighthouse.$identity.set(identity);
    } catch {
      hydration.note({ message: "cached authority corrupt — discarded" });
      localStorage.removeItem(key);
    }
  }

  const identity = lighthouse.$identity.get()?.id ?? null;
  hydration.note({
    message: identity ? "authority restored from cache" : "no cached authority",
    identity,
    refresh: !!lighthouse.$authority.get()?.refresh,
  });
  hydration.close();

  effect([lighthouse.$authority, lighthouse.$identity], (authority, identity) => {
    if (authority || identity) {
      localStorage.setItem(key, JSON.stringify({ authority, identity }));
    } else {
      localStorage.removeItem(key);
    }
  });
}

function seedLighthouse(lighthouse) {
  return (vector) =>
    vector
      .use(shard.context.attach("lighthouse", lighthouse))
      .use(shard.context.attach("channel", lighthouse.channel));
}

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
  if (lighthouse.$populating) return lighthouse.$populating;
  if (lighthouse.$daemons.get().length) return lighthouse.$status.set({ code: "VERIFIED" });

  lighthouse.$status.set({ code: "POPULATING" });
  lighthouse.$populating = (async () => {
    lighthouse.manifest = await lighthouse.connection.call("/manifest");
    const mounting = logger.entry("daemons").open();
    await lighthouse.dataspace.populate(["daemon"]);
    lighthouse.$daemons.set([...lighthouse.dataspace.daemon.$entities.get()]);
    const mounted = lighthouse.$daemons.get();
    mounting.note({
      message: `${mounted.length} daemon${mounted.length === 1 ? "" : "s"} mounted`,
      daemons: mounted.map((daemon) => daemon.slug).join(","),
    });
    mounting.close();
  })();
  try {
    await lighthouse.$populating;
  } finally {
    lighthouse.$populating = null;
    lighthouse.$status.set({ code: "VERIFIED" });
  }
}
