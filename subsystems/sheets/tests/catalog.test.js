import { specimen } from "@vivalence/typology";
import { frame, palette, parts, screen, settle } from "./scenarios/index.js";

const rows = (setup) => setup.captureCharFrame().replace(/\n$/, "").split("\n").map((line) => line.trimEnd());

const CATALOG = [{ nature: "/thread", chord: "leader/t" }, { nature: "/tune", chord: "leader/h t" }, { nature: "/quit", chord: "" }];

specimen.describe("Catalog — the repl's strip, narrowed by what is typed", () => {
  specimen.it("a line field over every command; typing narrows the rows", async () => {
    const { Catalog } = await parts;
    const setup = await screen(() => Catalog({ palette: palette(), catalog: CATALOG, onPick: () => {} }), { width: 40, height: 4 });
    await settle(setup);
    specimen.expect(rows(setup).slice(1)).toEqual(["       /thread          leader/t", "       /tune            leader/h t", "       /quit"]);
    setup.mockInput.pressKey("t");
    setup.mockInput.pressKey("u");
    await settle(setup);
    specimen.expect(rows(setup)).toEqual([" << tu▌", "       /tune            leader/h t", "", ""]);
    setup.renderer.destroy();
  });

  specimen.it("narrow is a substring over the nature", async () => {
    const { narrow } = await parts;
    specimen.expect(narrow(CATALOG, "/t").map((command) => command.nature)).toEqual(["/thread", "/tune"]);
  });
});
