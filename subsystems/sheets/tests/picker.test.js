import * as kit from "../index.js";
import { specimen } from "@vivalence/typology";
import { escape, holding } from "./world.js";

const rows = [
  { owner: "@viva", type: "instance", slug: "localhost" },
  { owner: "@viva", type: "instance", slug: "multiplayer" },
  { owner: "@localhost", type: "instance", slug: "standalone" },
];

const lens = (extra = {}) => ({
  label: "instance",
  rows,
  keys: ["owner", "type", "slug"],
  facets: ["owner", "type"],
  columns: ["owner", "slug"],
  query: "",
  index: 0,
  ...extra,
});

specimen.describe("Picker — rows narrowed by typing, the chosen row released", () => {
  specimen.it("shows the prompt, every row in its columns, the count and the facets", async () => {
    const view = await holding(kit, "picker", lens());
    const frame = view.frame();
    specimen.expect(frame).toContain("instance ›");
    specimen.expect(frame).toContain("› @viva       localhost");
    specimen.expect(frame).toContain("  @localhost  standalone");
    specimen.expect(frame).toContain("3/3  ·  owner: type:");
    view.setup.renderer.destroy();
  });

  specimen.it("the query presets the narrowing; enter releases the highlighted row", async () => {
    const view = await holding(kit, "picker", lens({ query: "@viva" }));
    specimen.expect(view.frame()).toContain("2/3");
    view.setup.mockInput.pressArrow("down");
    await view.settle();
    view.setup.mockInput.pressEnter();
    specimen.expect(await view.held.released).toEqual(rows[1]);
    view.setup.renderer.destroy();
  });

  specimen.it("typing narrows, a facet narrows only its field", async () => {
    const view = await holding(kit, "picker", lens());
    await view.setup.mockInput.typeText("owner:@local");
    await view.settle();
    specimen.expect(view.frame()).toContain("1/3");
    view.setup.mockInput.pressEnter();
    specimen.expect(await view.held.released).toEqual(rows[2]);
    view.setup.renderer.destroy();
  });

  specimen.it("backspace widens again", async () => {
    const view = await holding(kit, "picker", lens({ query: "standalone" }));
    specimen.expect(view.frame()).toContain("1/3");
    for (const _ of "standalone") view.setup.mockInput.pressBackspace();
    await view.settle();
    specimen.expect(view.frame()).toContain("3/3");
    view.setup.renderer.destroy();
  });

  specimen.it("nothing matching shows no match and enter releases nothing", async () => {
    const view = await holding(kit, "picker", lens({ query: "zzz" }));
    specimen.expect(view.frame()).toContain("no match");
    view.setup.mockInput.pressEnter();
    await view.settle();
    await escape(view.setup);
    specimen.expect(await view.held.released).toEqual({ aborted: true });
    view.setup.renderer.destroy();
  });

  specimen.it("the index opens the picker on that row", async () => {
    const view = await holding(kit, "picker", lens({ index: 2 }));
    specimen.expect(view.frame()).toContain("› @localhost  standalone");
    view.setup.renderer.destroy();
  });
});
