import { specimen } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";

const NATURES = ["/modes", "/mode", "/mode/close", "/theme", "/frame/mode", "/model", "/dock/more"];
const catalog = NATURES.map((nature) => ({ nature, args: false, options: [] }));
const natures = (draft) => ghost.belt.catalog.completions(catalog, draft).map((completion) => completion.row.nature);

specimen.describe("belt.catalog.completions — a direct hit first, then a prefix, a substring, a scatter; the shorter nature wins a tie", () => {
  specimen.it("a direct hit leads its longer siblings, whatever the catalog's order", () => {
    specimen.expect(natures("/mode")).toEqual(["/mode", "/modes", "/model", "/mode/close", "/frame/mode"]);
    specimen.expect(natures("/MODE")).toEqual(natures("/mode"));
  });

  specimen.it("a prefix leads a substring, a substring leads a scatter, shorter first inside each", () => {
    specimen.expect(natures("/mod")).toEqual(["/mode", "/modes", "/model", "/mode/close", "/frame/mode"]);
    specimen.expect(natures("/me")).toEqual(["/theme", "/frame/mode", "/mode", "/modes", "/model", "/dock/more", "/mode/close"]);
  });

  specimen.it("nothing typed keeps the catalog's order; the catalog is not mutated", () => {
    specimen.expect(natures("/")).toEqual(NATURES);
    natures("/mode");
    specimen.expect(catalog.map((command) => command.nature)).toEqual(NATURES);
  });

  specimen.it("listed fills the draft from the ranked completions", () => {
    specimen.expect(ghost.belt.catalog.listed(catalog, "/mode").at(0)).toBe("/mode");
  });
});

const REFERENCES = [
  "/daemon/education/mode/tactic/harvest/drain",
  "/daemon/education/mode/teacher/francesca/drill",
  "/runtime/runtime/mode/harness/runtime/fs/read",
  "/runtime/runtime/mode/harness/runtime/fs/delete",
];
const LOADING = [{ nature: "/tool/load", args: true, options: [], input: { type: "object", properties: { references: { type: "array" } } } }, ...catalog];

specimen.describe("belt.catalog.segments · pathing — a references command completes one segment, a word filters, a space ticks", () => {
  specimen.it("a path completes its next segment; nothing typed offers the roots", () => {
    specimen.expect(ghost.belt.catalog.segments(REFERENCES, "/daemon/education/mode/ta")).toEqual(["/daemon/education/mode/tactic"]);
    specimen.expect(ghost.belt.catalog.segments(REFERENCES, "/daemon/education/mode/tactic/")).toEqual(["/daemon/education/mode/tactic/harvest"]);
    specimen.expect(ghost.belt.catalog.segments(REFERENCES, "/daemon/education/mode/t")).toEqual(["/daemon/education/mode/tactic", "/daemon/education/mode/teacher"]);
    specimen.expect(ghost.belt.catalog.segments(REFERENCES, "")).toEqual(["/daemon", "/runtime"]);
  });

  specimen.it("a word filters whole references", () => {
    specimen.expect(ghost.belt.catalog.segments(REFERENCES, "fs")).toEqual(REFERENCES.slice(2));
  });

  specimen.it("pathing ticks every earlier word, completes the last; a command without references is not pathed", () => {
    const pathed = ghost.belt.catalog.pathing(LOADING, "/tool/load /runtime/runtime/mode/harness/runtime/fs/read /daemon/education/mode/ta", () => REFERENCES);
    specimen.expect(pathed).toEqual({
      nature: "/tool/load",
      filter: "/daemon/education/mode/ta",
      head: "/tool/load /runtime/runtime/mode/harness/runtime/fs/read",
      ticked: ["/runtime/runtime/mode/harness/runtime/fs/read"],
      options: ["/daemon/education/mode/tactic"],
    });
    specimen.expect(ghost.belt.catalog.pathing(LOADING, "/mode chat", () => REFERENCES)).toBe(null);
  });
});
