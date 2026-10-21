import { join } from "@std/path";
import { specimen } from "@vivalence/typology";
import { design, frame, palette } from "./scenarios/index.js";

const SNAPSHOTS = new URL("./snapshots", import.meta.url).pathname;
const HOT = Deno.env.get("SNAPSHOT_HOT") === "1";

const pin = (text, file) => {
  if (HOT) {
    Deno.mkdirSync(SNAPSHOTS, { recursive: true });
    Deno.writeTextFileSync(join(SNAPSHOTS, file), text);
  }
  specimen.expect(text).toBe(Deno.readTextFileSync(join(SNAPSHOTS, file)));
};

specimen.describe("design — the parts page over the five sample worlds", () => {
  specimen.it("renders idle · running · consent · paused · faulted; the frame is pinned", async () => {
    const { Page, WORLDS } = await design;
    specimen.expect(WORLDS.map((world) => world.name)).toEqual(["idle", "running", "consent", "paused", "faulted"]);
    const text = await frame(() => Page({ palette: palette(), worlds: WORLDS }), { width: 100, height: 140 });
    for (const world of WORLDS) specimen.expect(text).toContain(` ${world.name} ● ⠹ ? ! ‖ ○ `);
    pin(text, "design.northsea.2.txt");
  });
});
