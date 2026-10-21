import { specimen } from "@vivalence/typology";
import { design, palette, parts, screen, settle } from "./scenarios/index.js";

const wait = (ms) => new Promise((wake) => setTimeout(wake, ms));

const marked = async () => {
  const { Bar, TAP } = await parts;
  const world = (await design).WORLDS.find((held) => held.name === "idle");
  const gestures = [];
  const setup = await screen(() => Bar({ palette: palette(), ...world, onMark: (gesture) => gestures.push(gesture) }), { width: 100, height: 1 });
  await settle(setup);
  return { setup, gestures, TAP };
};

specimen.describe("gesture — the mark's pointer events classified: click · double · hold, one each", () => {
  specimen.it("a click on << is a click once the tap window closes; two inside it are one double", async () => {
    const { setup, gestures, TAP } = await marked();
    await setup.mockMouse.click(1, 0);
    specimen.expect(gestures).toEqual([]);
    await wait(TAP + 40);
    await setup.mockMouse.doubleClick(1, 0);
    await wait(TAP + 40);
    setup.renderer.destroy();
    specimen.expect(gestures).toEqual(["click", "double"]);
  });

  specimen.it("a press held past the hold window is a hold; its release is swallowed", async () => {
    const { setup, gestures, TAP } = await marked();
    const { HOLD } = await parts;
    await setup.mockMouse.pressDown(1, 0);
    await wait(HOLD + 40);
    await setup.mockMouse.release(1, 0);
    await wait(TAP + 40);
    setup.renderer.destroy();
    specimen.expect(gestures).toEqual(["hold"]);
  });

  specimen.it("a click off the mark is no gesture", async () => {
    const { setup, gestures, TAP } = await marked();
    await setup.mockMouse.click(6, 0);
    await wait(TAP + 40);
    setup.renderer.destroy();
    specimen.expect(gestures).toEqual([]);
  });
});
