import "../surface/chrome/host/index.js";
import * as kit from "../surface/chrome/keys.js";
import { parseKeypress } from "@opentui/core";
import { Pipe, specimen } from "@vivalence/typology";
import { screen, settle } from "./world.js";

const ROWS = [
  ["\x14", "ctrl-t"],
  ["\x0f", "ctrl-o"],
  ["\x06", "ctrl-f"],
  ["\x1b", "esc"],
  ["\r", "enter"],
  ["f", "f"],
  ["F", "F"],
  ["é", "é"],
  ["/", "/"],
  [" ", "space"],
  ["\t", "tab"],
  ["\x7f", "backspace"],
  ["\x1b[A", "up"],
  ["\x1bf", "meta-f"],
];

specimen.describe("press(event) — a keypress becomes { key }", () => {
  for (const [sequence, key] of ROWS) {
    specimen.it(`${JSON.stringify(sequence)} → ${key}`, () => {
      specimen.expect(kit.press(parseKeypress(sequence))).toEqual({ key });
    });
  }
});

specimen.describe("keypresses(renderer) — the renderer's keys as a source a Pipe drains", () => {
  specimen.it("ctrl-t · esc · enter · plain chars arrive in order, and the source closes with the renderer", async () => {
    const setup = await screen();
    const source = kit.keypresses(setup.renderer);
    const pipe = new Pipe().from(source);
    const seen = [];
    pipe.tap((value) => seen.push(value));
    setup.mockInput.pressKey("t", { ctrl: true });
    setup.mockInput.pressEscape();
    await new Promise((resolve) => setTimeout(resolve, 60));
    setup.mockInput.pressEnter();
    await setup.mockInput.typeText("fa");
    await settle(setup);
    specimen.expect(seen).toEqual([{ key: "ctrl-t" }, { key: "esc" }, { key: "enter" }, { key: "f" }, { key: "a" }]);
    specimen.expect(source.closed).toBe(false);
    setup.renderer.destroy();
    specimen.expect(source.closed).toBe(true);
  });

});
