import { Vector } from "@vivalence/typology";

const card = (daemon) => ({ id: daemon.id, slug: daemon.slug, remote: daemon.remote, reported: daemon.reported, updatedAt: daemon.updatedAt });

export const daemons = new Vector().open("/announce", async ({ slug, remote, reported = "UNKNOWN" }, ctx) => {
  if (!slug || !remote) {
    ctx.response.status = 400;
    return { status: "ERROR", error: { code: "INVALID_INPUT", message: "Daemon slug and remote required" } };
  }
  const daemon = await ctx.entities.daemon.ensure({ slug, remote, reported });
  await ctx.entities.em.flush();
  return card(daemon);
});
