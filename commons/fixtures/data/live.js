import { Connection, Url, shard } from "@vivalence/typology";

export const BASE = "http://localhost:2501";

export const CREDENTIALS = { username: "beef", password: "biggusdickus" };

const unreachable = (error) => error?.type === "NETWORK" || error?.type === "TIMEOUT";

export async function live({ base = BASE, daemon, credentials = CREDENTIALS } = {}) {
  const connection = new Connection(new Url(base), shard.transmitter.fetcher);

  let daemons;
  try {
    daemons = await connection.call("/metadata/daemons", {});
  } catch (error) {
    return {
      base,
      connection,
      daemons: [],
      up: false,
      reason: unreachable(error)
        ? `no runtime at ${base}`
        : `runtime at ${base} refused /metadata/daemons — ${error.message}`,
    };
  }

  const mounted = daemons.filter((entry) => entry.modes > 0);
  const chosen = daemon ? mounted.find((entry) => entry.slug === daemon) : mounted[0];
  const census = daemons.map((entry) => `${entry.slug}(${entry.modes})`).join(", ") || "none";
  if (!chosen)
    return {
      base,
      connection,
      daemons,
      up: true,
      reason: daemon
        ? `runtime up, daemon "${daemon}" not mounted — mounts: ${census}`
        : `runtime up, no daemon mounts modes — mounts: ${census}`,
    };

  let session;
  try {
    session = await connection.call(
      "/attached/process/lighthouse/multiplayer/auth/login",
      credentials,
    );
  } catch (error) {
    return {
      base,
      connection,
      daemons,
      up: true,
      reason: `runtime up on ${chosen.slug}, lighthouse login failed — ${error.message}`,
    };
  }

  connection.use(async (ctx, next) => {
    ctx.request.headers.set("authorization", `Bearer ${session.authority.access}`);
    await next();
  });

  const modes = await connection.call(`/daemon/${chosen.slug}/metadata/modes`, {});

  return {
    base,
    connection,
    daemons,
    up: true,
    slug: chosen.slug,
    mount: chosen.mount,
    identity: session.identity,
    authority: session.authority,
    modes,
    mounts: (identifier) => modes.some((mode) => `${mode.type}/${mode.slug}` === identifier),
  };
}
