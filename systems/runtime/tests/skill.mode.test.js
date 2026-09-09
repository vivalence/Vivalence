import { assert, assertEquals } from "@std/assert";
import { Path, shard, steer, ToolCall, Vector } from "@vivalence/typology";
import * as skills from "../daemon/skills/index.js";

const invoke = (armed, name, input) =>
  steer.dispatch.invoke(armed, new ToolCall(name).signal, steer.strategy.guarded)(input);

// three modes, three shapes: one that serves a mountpoint, one that carries freight, one with neither
const vdex = {
  manifest: { type: "office", slug: "vdex", name: "VDex", traits: ["MOUNTED", "HARNESSED"] },
  module: { mount: new Path("/registry/vcompany/modes/office/vdex/vdex.viva.js") },
  mountpoint: new Path("/Users/finn/vivalence/coorporation"),
  freight: { path: new Path("/Users/finn/vivalence/coorporation") },
};
const francesca = {
  manifest: { type: "tutor", slug: "francesca", traits: ["FRAUGHT", "HARNESSED"] },
  module: { mount: new Path("/registry/education/modes/tutor/francesca/francesca.viva.js") },
  freight: { path: new Path("/registry/education/modes/tutor/francesca/assets") },
};
const dewey = { manifest: { type: "teacher", slug: "dewey", traits: ["EXPOSED", "HARNESSED"] }, module: {} };

const daemon = {
  manifest: { slug: "vcompany" },
  mountpoint: new Path("/Users/finn/.viva/instances/vivalence/mountpoint/daemon_vcompany"),
  flatmodes: () => [vdex, francesca, dewey],
};

const armed = new Vector().use(shard.context.bind("daemon", daemon)).slurp(skills.mode.mode);

Deno.test("skill.mode — every mode's places on disk", async (t) => {
  await t.step("places: source, then what a mode serves, then what it carries when that differs", () => {
    assertEquals(
      skills.mode.places(vdex),
      "source /registry/vcompany/modes/office/vdex · mountpoint /Users/finn/vivalence/coorporation",
    );
    assertEquals(
      skills.mode.places(francesca),
      "source /registry/education/modes/tutor/francesca · freight /registry/education/modes/tutor/francesca/assets",
    );
    assertEquals(skills.mode.places(dewey), "");
  });

  await t.step("mode_find lists the daemon and every mode as rows", async () => {
    const spoken = await invoke(armed, "mode_find", {});
    const rows = spoken.output.message.split("\n");
    assertEquals(rows[0], "[Daemon vcompany] · mountpoint /Users/finn/.viva/instances/vivalence/mountpoint/daemon_vcompany");
    assertEquals(
      rows[1],
      "office/vdex · VDex · traits MOUNTED HARNESSED · source /registry/vcompany/modes/office/vdex · " +
        "mountpoint /Users/finn/vivalence/coorporation",
    );
    assertEquals(rows[3], "teacher/dewey · dewey · traits EXPOSED HARNESSED");
    assertEquals(rows.length, 4);
  });

  await t.step("mode_find narrows by type and by slug", async () => {
    const byType = await invoke(armed, "mode_find", { type: "tutor" });
    assertEquals(byType.output.message.split("\n").length, 2);
    assert(byType.output.message.includes("tutor/francesca"));
    const bySlug = await invoke(armed, "mode_find", { slug: "vdex" });
    assertEquals(bySlug.output.message.split("\n").length, 2);
    assert(bySlug.output.message.includes("office/vdex"));
    const none = await invoke(armed, "mode_find", { slug: "nobody" });
    assertEquals(none.output.message.split("\n").length, 1);
  });

  await t.step("a daemon without a mountpoint names none", async () => {
    const bare = new Vector()
      .use(shard.context.bind("daemon", { manifest: { slug: "test-daemon" }, flatmodes: () => [dewey] }))
      .slurp(skills.mode.mode);
    const spoken = await invoke(bare, "mode_find", {});
    assertEquals(spoken.output.message.split("\n")[0], "[Daemon test-daemon]");
  });
});
