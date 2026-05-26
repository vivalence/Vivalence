import { $authority, $identity, persist, clear, read } from "../lib/session.js"
import * as connect from "../lib/connect.js"

export function auth(trajectory) {
  const branch = trajectory.branch("/auth")

  branch.use(async (ctx, next) => {
    ctx.lighthouse = connect.lighthouse(ctx.lighthouseUrl)
    await next()
  })

  branch.open("/login", async (ctx) => {
    const [username, password] = ctx.argv

    if (!username || !password) {
      throw new Error("usage: viva auth/login <username> <password>")
    }

    const response = await ctx.lighthouse.fetch("/auth/login", { username, password })

    if (response.error) {
      throw new Error(response.body?.error?.message || "login failed")
    }

    const { authority, identity } = response.body
    persist(authority, identity)

    return { status: "OK", identity }
  })

  branch.open("/status", () => {
    const session = read()
    const identity = session.identity
    const hasToken = !!session.authority?.access

    if (!identity) return { status: "NOT_LOGGED_IN" }

    return {
      status: "LOGGED_IN",
      identity,
      hasAccessToken: hasToken,
      hasRefreshToken: !!session.authority?.refresh,
    }
  })

  branch.open("/verify", async (ctx) => {
    const auth = $authority.get()
    if (!auth?.access) return { status: "NO_TOKEN" }

    try {
      const result = await ctx.lighthouse.call("/auth/verify", { access: auth.access })
      return { status: "OK", identity: result.identity }
    } catch {
      if (!auth.refresh) return { status: "EXPIRED" }

      try {
        const refreshed = await ctx.lighthouse.call("/auth/refresh", { refresh: auth.refresh })
        $authority.set({ ...auth, access: refreshed.access })
        return { status: "REFRESHED" }
      } catch {
        clear()
        return { status: "SESSION_EXPIRED" }
      }
    }
  })

  branch.open("/refresh", async (ctx) => {
    const auth = $authority.get()
    if (!auth?.refresh) throw new Error("no refresh token")

    const result = await ctx.lighthouse.call("/auth/refresh", { refresh: auth.refresh })
    $authority.set({ ...auth, access: result.access })

    return { status: "OK" }
  })

  branch.open("/logout", async (ctx) => {
    const auth = $authority.get()

    if (auth?.refresh) {
      await ctx.lighthouse.fetch("/auth/logout", { refresh: auth.refresh }).catch(() => {})
    }

    clear()
    return { status: "LOGGED_OUT" }
  })
}
