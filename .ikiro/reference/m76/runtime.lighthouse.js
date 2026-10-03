const refuse = (ctx, status, code, message) => {
  ctx.response.status = status;
  ctx.response.body = { status: "ERROR", error: { code, message } };
};

const bearer = (ctx) => {
  const header = ctx.request.headers?.get("authorization");
  const param = ctx.request.url.searchParams?.get("token");
  return header?.startsWith("Bearer ") ? header.split(" ")[1] : param;
};

export class Lighthouse {
  constructor(connection, { users, status, daemon, remote }) {
    this.connection = connection;
    this.users = users;
    this.status = status;
    this.daemon = daemon;
    this.remote = remote;
    this.announced = null;
    this.shard = {
      authenticate: (ctx, next) => this.identify(ctx, next),
      authorize: (ctx, next) => this.identify(ctx, () => this.admit(ctx, next)),
    };
    status.$transient.subscribe(() => (this.announced = this.announce()));
  }

  announce() {
    return this.connection.call("/daemons/announce", { slug: this.daemon, remote: this.remote, reported: this.status.code });
  }

  async identify(ctx, next) {
    if (ctx.lighthouse) return await next();
    const token = bearer(ctx);
    if (!token) return refuse(ctx, 401, "MISSING_TOKEN", "Authorization header or token param required");
    try {
      ctx.lighthouse = await this.authenticate(token);
    } catch (error) {
      return refuse(ctx, 401, "INVALID_TOKEN", error.message);
    }
    await next();
  }

  async admit(ctx, next) {
    try {
      ctx.user = await ctx.lighthouse.getUser();
    } catch {
      return refuse(ctx, 500, "USER_LOOKUP_FAILED", "Failed to retrieve user");
    }
    if (!ctx.user) return refuse(ctx, 401, "USER_NOT_FOUND", "no userspace in this daemon — /userspace/handshake first");
    await next();
  }

  async verify(token) {
    const response = await this.connection.fetch("/auth/verify", { access: token }, { method: "POST" });
    if (response.ok) return response.body;
    return response.body?.status === "ERROR"
      ? response.body
      : { status: "ERROR", error: { code: "VERIFY_FAILED", message: "Verification failed" } };
  }

  async authenticate(token) {
    if (!token) throw new Error("Token required");
    const result = await this.verify(token);
    if (result.status === "ERROR") {
      const error = new Error(result.error.message);
      error.code = result.error.code;
      throw error;
    }
    const { identity } = result;
    if (!identity?.id) throw new Error("Identity not found in token");
    return {
      getUser: () => this.users.findOne({ id: identity.id }),
      enroll: async () => {
        const granted = await this.connection.fetch("/auth/enroll", { access: token, daemon: this.daemon }, { method: "POST" });
        if (granted.body?.status !== "SUCCESS") throw new Error(granted.body?.error?.message ?? "Enrollment refused by the lighthouse");
        await this.users.upsert({ id: identity.id, roles: ["USER"], config: {} }, { onConflictAction: "ignore" });
        return this.users.findOne({ id: identity.id });
      },
    };
  }
}
