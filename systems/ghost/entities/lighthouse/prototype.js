import { map, atom, computed } from "nanostores";
import { Span, v } from "@vivalence/typology";

export const STANDINGS = ["IDLE", "AUTHENTICATING", "AUTHENTICATED", "VERIFYING", "REFRESHING", "REFRESHED", "POPULATING", "VERIFIED", "OFFLINE", "ERROR", "SESSION_EXPIRED", "LOGGED_OUT"];

export class Lighthouse {
  $authority = map({});
  $user = map({});
  $status = atom({ code: "IDLE" });
  $isAuthorized = computed(this.$authority, (authority) => !!authority?.access && !!authority?.refresh);
  $isIdentified = computed(this.$user, (user) => !!user?.id);

  manifest = null;
  connection = null;
  stdout = new Span("lighthouse");

  constructor() {
    this.$status.listen((status) => this.stdout.mark("status", status));
  }

  get authority() {
    return this.$authority.get();
  }
  get user() {
    return this.$user.get();
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

  restore(held) {
    const faults = v.primitives.credentials.Credential.faults(held);
    if (faults.length === 0) {
      this.$authority.set(held.authority);
      this.$user.set(held.user);
      return true;
    }
    this.stdout.mark("note", { message: "cached credential is not one — discarded", faults });
    return false;
  }

  implements(name) {
    return this.manifest !== null && this.manifest.traits.includes(name);
  }

  signup(username, password) {
    return this.access("/lighthouse/signup", { username, password });
  }

  login(username, password) {
    return this.access("/lighthouse/login", { username, password });
  }

  autologin() {
    return this.access("/lighthouse/autologin", {});
  }

  async access(route, credentials) {
    this.$status.set({ code: "AUTHENTICATING" });
    const response = await this.connection.fetch(route, credentials);
    if (response.error) {
      this.$status.set({ code: "ERROR", message: response.error.message, type: response.error.type });
      return { status: "ERROR", error: response.error };
    }
    const { authority, user } = response.body;
    if (user) this.$user.set(user);
    if (authority) this.$authority.set(authority);
    this.$status.set({ code: "AUTHENTICATED" });
    return { status: "OK", user };
  }

  async verify() {
    const authority = this.$authority.get();
    if (!authority?.access) return { status: "NO_TOKEN" };
    this.$status.set({ code: "VERIFYING" });
    const response = await this.connection.fetch("/lighthouse/verify", { access: authority.access });
    if (response.isNetworkError) {
      this.$status.set({ code: "OFFLINE", message: "Network unavailable", canRetry: true });
      return { status: "NETWORK_ERROR", canRetry: true };
    }
    if (response.isAuthError) return this.refresh();
    if (response.error) {
      this.$status.set({ code: "ERROR", message: response.error.message });
      return { status: "ERROR", error: response.error };
    }
    if (response.body.status === "SUCCESS") {
      if (response.body.user) this.$user.set(response.body.user);
      return { status: "OK" };
    }
    return { status: "INVALID" };
  }

  async refresh() {
    const authority = this.$authority.get();
    if (!authority?.refresh) return { status: "NO_REFRESH_TOKEN" };
    this.$status.set({ code: "REFRESHING" });
    const response = await this.connection.fetch("/lighthouse/refresh", { refresh: authority.refresh });
    if (response.isNetworkError) {
      this.$status.set({ code: "OFFLINE", message: "Network unavailable", canRetry: true });
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
      this.$authority.set({ ...authority, access });
      this.$status.set({ code: "REFRESHED" });
      return { status: "OK" };
    }
    this.logout();
    return { status: "REFRESH_FAILED" };
  }

  logout() {
    const authority = this.$authority.get();
    this.$authority.set(null);
    this.$user.set(null);
    this.$status.set({ code: "LOGGED_OUT" });
    if (authority?.refresh) this.connection.fetch("/lighthouse/logout", { refresh: authority.refresh }).catch(() => {});
  }

  get json() {
    return { status: this.$status.get(), isIdentified: this.$isIdentified.get(), isAuthorized: this.$isAuthorized.get(), user: this.$user.get(), authority: this.$authority.get() };
  }

  toJSON() {
    return this.json;
  }
}
