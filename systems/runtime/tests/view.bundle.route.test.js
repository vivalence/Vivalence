import { Aperture, shape, shard, specimen } from "@vivalence/typology";
import { seed } from "./scenarios/fixtures.js";
import { connector, lighthouseOf } from "./scenarios/daemon.js";
import { userspace } from "../subjects/runtime/lifecycle/integration.js";

specimen.describe("/userspace/entities/view/bundle reads { data } off ctx.input — the route seats the mode it names", () => {
  let world;
  let connection;

  specimen.beforeAll(async () => {
    world = await seed({});
    const { datamap, runtime, twitch } = world;
    const aperture = new Aperture().use(shard.datamap.inject(datamap));
    const die = {
      aperture,
      runtime: { datamap, entities: runtime, twitch, lighthouse: lighthouseOf(datamap, runtime.user), modes: {}, daemons: {} },
    };
    await userspace(die, async () => {});
    connection = await connector(shape.http(aperture))(world.fixtures.user);
  });
  specimen.afterAll(async () => {
    await world.orm.close();
  });

  specimen.it("a bundle for a mode no live host holds is loud with that mode's id — the payload was read, not the context", async () => {
    await specimen.expect(connection.call("/userspace/entities/view/bundle", { data: { mode: 4242, slug: "board", mime: "text/html", entry: "/nowhere/board.html" } }))
      .rejects.toThrow("[view/bundle] no live mode holds entity 4242");
  });
});
