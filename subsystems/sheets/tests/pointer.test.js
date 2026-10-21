import { specimen } from "@vivalence/typology";
import { palette, parts, screen, settle } from "./scenarios/index.js";

specimen.describe("pointer — one resolver at the root; the nearest renderable naming a cursor wins, else default", () => {
  specimen.it("over a Segment the pointer is the hand; onto empty screen only an out fires, so out is default", async () => {
    const { Segment, pointer } = await parts;
    const setup = await screen(() => Segment({ palette: palette(), label: "[e4]" }), { width: 20, height: 3 });
    await settle(setup);
    const shapes = [];
    setup.renderer.setMousePointer = (shape) => shapes.push(shape);
    pointer(setup.renderer);
    await setup.mockMouse.moveTo(1, 0);
    await setup.mockMouse.moveTo(10, 2);
    await setup.mockMouse.moveTo(2, 0);
    setup.renderer.destroy();
    specimen.expect(shapes).toEqual(["pointer", "default", "pointer"]);
  });

  specimen.it("nearest walks parents: a child without a cursor inherits its ancestor's; the root's absence is default", async () => {
    const { nearest } = await parts;
    const root = { parent: null };
    const segment = { parent: root, cursor: "pointer" };
    specimen.expect([nearest({ parent: segment }), nearest(segment), nearest(root)]).toEqual(["pointer", "pointer", "default"]);
  });
});
