import { specimen } from "@vivalence/typology";
import { frame, palette, parts, design } from "./scenarios/index.js";

const world = async (name) => (await design).WORLDS.find((held) => held.name === name);

const bar = async (name, width = 100, over = {}) => {
  const { Bar } = await parts;
  const held = { ...(await world(name)), ...over };
  return (await frame(() => Bar({ palette: palette(), ...held }), { width, height: 1 })).split("\n");
};

specimen.describe("Bar — the mode bar, one row: mark · entity · harness · activity · display · system", () => {
  specimen.it("idle: no activity segment; the segments left to right, display and system right, the system a bare dot", async () => {
    specimen.expect((await bar("idle"))[0]).toMatch(/^ <<  \[e4 openings ‹board\/play›\]  \{capable ██░░░░\}\s+\[right\]  ● $/);
  });

  specimen.it("no harness, no braces: harness null drops its segment", async () => {
    specimen.expect((await bar("idle", 100, { harness: null }))[0]).toMatch(/^ <<  \[e4 openings ‹board\/play›\]\s+\[right\]  ● $/);
  });

  specimen.it("running: the activity segment shows; consent: ? approve; faulted: ! and the context meter at caution", async () => {
    specimen.expect((await bar("running"))[0]).toMatch(/▰▱ running · r3\/10/);
    specimen.expect((await bar("consent"))[0]).toMatch(/\?▰▱ approve match_move/);
    specimen.expect((await bar("faulted"))[0]).toMatch(/\{capable ██████\}  !▰▱ fault · r3/);
  });

  specimen.it("the display word is a table over view × align: docked names its side, the rest name the view", async () => {
    const { display } = await parts;
    specimen.expect(display({ view: "docked", align: "left" })).toBe("left");
    specimen.expect(display({ view: "full", align: "right" })).toBe("full");
    specimen.expect(display({ view: "messenger", align: "right" })).toBe("messenger");
    specimen.expect(display({ view: "closed", align: "right" })).toBe("closed");
    specimen.expect(() => display({ view: "docked", align: "centre" })).toThrow(/not a dock align/);
  });
});
