import { join } from "@std/path";
import { Cortex, specimen } from "@vivalence/typology";
import { mountMode } from "@vivalence/runtime/scenarios";
import * as oracle from "../../../commons/playground/chaosmonkey/oracle/oracle.viva.js";
import * as root from "../../../commons/harnesses/runtime/runtime-harness.viva.js";

const SNAPSHOTS = new URL("./snapshots", import.meta.url).pathname;
const HOT = Deno.env.get("SNAPSHOT_HOT") === "1";
const MOUNT = "/mode/chaosmonkey/oracle";

let scenario;

specimen.beforeAll(async () => {
  scenario = await mountMode(oracle, { cortex: new Cortex() });
});
specimen.afterAll(async () => {
  await scenario.orm.close();
});

specimen.describe("harness — /metadata/harness is the strip a client wires: routes · primer · tools, nested, schematics whole", () => {
  specimen.it("the strip pins", async () => {
    const pojo = JSON.parse(JSON.stringify(await scenario.authedConn.branch(MOUNT).call("/metadata/harness")));
    if (HOT) specimen.snapshot(pojo, { base: SNAPSHOTS, locate: "harness-metadata.snapshot.json", parse: (value) => value });
    specimen.expect(pojo).toEqual(JSON.parse(Deno.readTextFileSync(join(SNAPSHOTS, "harness-metadata.snapshot.json"))));
    specimen.expect(Object.keys(pojo)).toEqual(["routes", "primer", "tools"]);
    specimen.expect(Object.keys(pojo.tools.branches)).toEqual(["fs", "shell", "lookup"]);
  });
});

specimen.describe("harness — /metadata/harness/primer/* reads one primer section as the model reads it", () => {
  let held;
  specimen.beforeAll(async () => {
    held = await mountMode(root, { cortex: new Cortex() });
  });
  specimen.afterAll(async () => {
    await held.orm.close();
  });

  specimen.it("the root harness strips six primer sections and the entity primers; identity reads whole; runtime · daemons · modes · threads read the rig; an unknown nature throws", async () => {
    const metadata = await held.authedConn.branch("/mode/harness/runtime").call("/metadata/harness");
    specimen.expect(Object.keys(metadata.primer.branches)).toEqual(["identity", "world", "runtime", "daemons", "modes", "threads", "entity"]);
    const read = (nature) => held.authedConn.branch("/mode/harness/runtime").call(`/metadata/harness/primer/${nature}`, { thread: held.fixtures.thread.id });
    specimen.expect((await read("identity")).startsWith("You are the operator's hands inside vivalence.")).toBe(true);
    specimen.expect(await read("runtime")).toContain(held.fixtures.thread.id);
    specimen.expect(await read("runtime")).toMatch(/^Runtime:\nmode harness\/runtime · /);
    specimen.expect((await read("daemons")).split("\n")[0]).toBe("host,slug,name,version,icon,description,consumes,statics");
    specimen.expect(await read("daemons")).toContain("/daemon/test-daemon,test-daemon,");
    specimen.expect((await read("modes")).split("\n")[0]).toBe("host,path,module,name,traits");
    specimen.expect(await read("modes")).toContain("/daemon/test-daemon,/mode/harness/runtime,");
    specimen.expect(await read("threads")).toContain(held.fixtures.thread.id);
    specimen.expect(await read("entity/thread")).toMatch(/^\[Thread\] one conversation/);
    await specimen.expect(read("nobody")).rejects.toThrow();
  });
});
