import { $authority, $identity, persist, clear, read } from "../lib/session.js"
import * as connect from "../lib/connect.js"

export default function auth(trajectory, client) {
  const branch = trajectory.branch("/auth")

  branch.open("/login", async (ctx) => {
    const [username, password] = ctx.argv

    if (!username || !password) {
      throw new Error("usage: viva auth/login <username> <password>")
    }

    const lighthouse = connect.lighthouse(client.lighthouseUrl)
    const response = await lighthouse.fetch("/auth/login", { username, password })

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

  branch.open("/verify", async () => {
    const auth = $authority.get()
    if (!auth?.access) return { status: "NO_TOKEN" }

    const lighthouse = connect.lighthouse(client.lighthouseUrl)

    try {
      const result = await lighthouse.call("/auth/verify", { access: auth.access })
      return { status: "OK", identity: result.identity }
    } catch {
      if (!auth.refresh) return { status: "EXPIRED" }

      try {
        const refreshed = await lighthouse.call("/auth/refresh", { refresh: auth.refresh })
        $authority.set({ ...auth, access: refreshed.access })
        return { status: "REFRESHED" }
      } catch {
        clear()
        return { status: "SESSION_EXPIRED" }
      }
    }
  })

  branch.open("/refresh", async () => {
    const auth = $authority.get()
    if (!auth?.refresh) throw new Error("no refresh token")

    const lighthouse = connect.lighthouse(client.lighthouseUrl)
    const result = await lighthouse.call("/auth/refresh", { refresh: auth.refresh })
    $authority.set({ ...auth, access: result.access })

    return { status: "OK" }
  })

  branch.open("/logout", async () => {
    const auth = $authority.get()

    if (auth?.refresh) {
      const lighthouse = connect.lighthouse(client.lighthouseUrl)
      await lighthouse.fetch("/auth/logout", { refresh: auth.refresh }).catch(() => {})
    }

    clear()
    return { status: "LOGGED_OUT" }
  })
}
