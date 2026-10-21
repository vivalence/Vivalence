import { specimen, Controller, Path, Span } from "@vivalence/typology";
import { Daemon, lifecycle } from "@vivalence/runtime";
import { lighthouse } from "../scenarios/index.js";

const SLUG = "test-language";

specimen.describe("lighthouse datamap (scenario)", () => {
  let scenario;
  let finn;
  let kiro;

  const members = () =>
    scenario.datamap.shard.scope(() =>
      scenario.orm.em.getConnection().execute("select user_entity_id as user, daemon_entity_slug as daemon from User_daemons order by user"),
    );

  specimen.beforeAll(async () => {
    scenario = await lighthouse.create();
    finn = await scenario.signup("finn");
    kiro = await scenario.signup("kiro");
    await scenario.seedDaemon(SLUG);
    const daemon = Object.assign(new Daemon(), {
      slug: SLUG,
      mask: { manifest: { type: "daemon", slug: SLUG }, reference: new Path(`/daemon/${SLUG}`) },
      controller: new Controller({ stdout: new Span(`daemon/${SLUG}`) }),
      domain: {},
    });
    scenario.runtime.daemons = { [SLUG]: daemon };
    await lifecycle.daemon.resolution.domain({ runtime: scenario.runtime, daemon }, async () => {});
    await lifecycle.runtime.resolution.expose({ aperture: scenario.aperture, runtime: scenario.runtime }, async () => {});
  });

  specimen.afterAll(async () => {
    await scenario.close();
  });

  specimen.describe("user card", () => {
    specimen.it("verify reads the card, never the authentication embed", async () => {
      const result = await scenario.conn.call("/lighthouse/verify", { access: finn.access });
      specimen.expect(result.user.slug).toBe("finn");
      specimen.expect(result.user.authentication).toBeUndefined();
    });
  });

  specimen.describe("daemon membership by use — no handshake", () => {
    specimen.it("/daemon/<slug>/status refuses with no token and writes nothing", async () => {
      const response = await scenario.conn.fetch(`/daemon/${SLUG}/status`);
      specimen.expect(response.status).toBe(401);
      specimen.expect(response.body.error.code).toBe("MISSING_TOKEN");
      specimen.expect(await members()).toEqual([]);
    });

    specimen.it("a user's first daemon request writes User_daemons, a second writes nothing new", async () => {
      const response = await scenario.connect(finn.access).fetch(`/daemon/${SLUG}/status`);
      specimen.expect(response.status).toBe(200);
      specimen.expect(await members()).toEqual([{ user: finn.user.id, daemon: SLUG }]);
      await scenario.connect(finn.access).fetch(`/daemon/${SLUG}/status`);
      specimen.expect(await members()).toEqual([{ user: finn.user.id, daemon: SLUG }]);
    });

    specimen.it("another user enrols on their own first request", async () => {
      await scenario.connect(kiro.access).fetch(`/daemon/${SLUG}/status`);
      const rows = await members();
      specimen.expect(rows.map((row) => row.user).sort()).toEqual([finn.user.id, kiro.user.id].sort());
    });
  });
});
