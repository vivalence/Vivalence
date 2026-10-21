import { join } from "@std/path";
import { Aperture, mime, Mode, Path, shape, shard, specimen } from "@vivalence/typology";
import { lifecycle, ViewEntity } from "@vivalence/runtime";
import { seed } from "../scenarios/datamap.js";
import { connector, lighthouseOf } from "../scenarios/daemon.js";

// m87 law 8 — datamap /view/bundle is the ONE route that hands a bundler in; the success path (view.bundle.route.test.js holds
// the loud miss): the payload is read off ctx.input, the View row and its Files land, the compile is on disk

let scenario;
let directory;

specimen.describe("integration.userspace — /userspace/entities/view/bundle seats the live mode and bundles through the repository verb", { sanitizeResources: false, sanitizeOps: false }, () => {
  specimen.beforeAll(async () => {
    scenario = await seed();
    directory = await Deno.makeTempDir({ prefix: "userspace-bundle-" });
  });
  specimen.afterAll(async () => {
    await scenario.orm.close();
    await Deno.remove(directory, { recursive: true });
  });

  specimen.it("an html source bundles under the seated mode's mountpoint: the View row, its two Files, the compile on disk", async () => {
    const mode = new Mode({ manifest: { type: "test", slug: "test", traits: [] } });
    mode.entity = scenario.fixtures.mode;
    mode.mountpoint = join(directory, "test");
    const die = {
      aperture: new Aperture().use(shard.datamap.inject(scenario.datamap)),
      runtime: {
        datamap: scenario.datamap,
        entities: scenario.repos,
        twitch: scenario.twitch,
        lighthouse: lighthouseOf(scenario.datamap, scenario.repos.user),
        modes: { test: { test: mode } },
        daemons: {},
      },
    };
    await lifecycle.runtime.integration.userspace(die, async () => {});
    const conn = await connector(shape.http(die.aperture))(scenario.fixtures.user);

    const bundled = await conn.call("/userspace/entities/view/bundle", { data: { mode: mode.entity.id, slug: "page", mime: mime.dom.html, source: "<p>bundled</p>" } });
    specimen.expect(bundled.slug).toBe("page");
    specimen.expect(bundled.entry).toMatch(/^bundle\/[0-9a-f]{16}\.dom\.html\.mjs$/);
    const held = await scenario.em.fork().findOneOrFail(ViewEntity, { id: bundled.id }, { populate: ["files"] });
    specimen.expect(held.files.getItems().map((file) => file.mime).sort()).toEqual([mime.dom.html, mime.javascript].sort());
    specimen.expect(await Deno.readTextFile(join(directory, "test", bundled.entry))).toContain("<p>bundled</p>");
  });
});
