import { specimen } from "@vivalence/typology";
import { frame, palette, parts } from "./scenarios/index.js";

const sides = (Line, held) => ({ frame: Line({ palette: held, text: "frame" }), dock: Line({ palette: held, text: "dock" }) });

specimen.describe("Split — one BSP split, the dock on a side with a share", () => {
  specimen.it("right: the frame, the divider, the dock at its share of the width", async () => {
    const { Split, Line } = await parts;
    const held = palette();
    const lines = (await frame(() => Split({ palette: held, align: "right", share: 40, ...sides(Line, held) }), { width: 50, height: 2 })).split("\n");
    specimen.expect(lines[0]).toMatch(/^frame\s{25}│dock\s+$/);
    specimen.expect(lines[1]).toMatch(/^\s{30}│\s+$/);
  });

  specimen.it("left mirrors; bottom stacks with a ─ divider", async () => {
    const { Split, Line } = await parts;
    const held = palette();
    specimen.expect((await frame(() => Split({ palette: held, align: "left", share: 40, ...sides(Line, held) }), { width: 50, height: 1 })).split("\n")[0]).toMatch(/^dock\s{15}│frame\s+$/);
    const lines = (await frame(() => Split({ palette: held, align: "bottom", share: 50, ...sides(Line, held) }), { width: 10, height: 4 })).split("\n");
    specimen.expect(lines[0]).toMatch(/^frame/);
    specimen.expect(lines[2]).toMatch(/^─{10}$/);
    specimen.expect(lines[3]).toMatch(/^dock/);
  });

  specimen.it("a share outside 20–80 throws; an align outside the four throws", async () => {
    const { share, align } = await parts;
    specimen.expect(() => share(15)).toThrow(/a share is 20–80, not 15/);
    specimen.expect(() => align("middle")).toThrow(/not a dock align: "middle" · right · left · bottom · top/);
  });
});
