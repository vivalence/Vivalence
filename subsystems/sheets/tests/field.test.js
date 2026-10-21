import { createSignal } from "solid-js";
import { specimen } from "@vivalence/typology";
import { frame, palette, parts, screen, settle } from "./scenarios/index.js";

specimen.describe("Field — the composer, the repl line, the filter", () => {
  specimen.it("› for a turn with its placeholder, << for a line; the keys sit right", async () => {
    const { Field } = await parts;
    specimen.expect(await frame(() => Field({ palette: palette(), value: "", placeholder: "say it, or / for a command", keys: "⏎" }), { width: 40, height: 1 })).toMatch(/^ › ▌say it, or \/ for a command\s+⏎ $/);
    specimen.expect(await frame(() => Field({ palette: palette(), prompt: "line", value: "/tune fa", focused: false }), { width: 40, height: 1 })).toMatch(/^ << \/tune fa\s+$/);
  });

  specimen.it("typing edits through onInput; enter submits the value", async () => {
    const { Field } = await parts;
    const [value, setValue] = createSignal("");
    const submitted = [];
    const setup = await screen(() => Field({ palette: palette(), get value() { return value(); }, onInput: setValue, onSubmit: (held) => submitted.push(held) }), { width: 20, height: 1 });
    await settle(setup);
    setup.mockInput.pressKey("h");
    setup.mockInput.pressKey("i");
    await settle(setup);
    specimen.expect(value()).toBe("hi");
    specimen.expect(setup.captureCharFrame()).toMatch(/^ › hi▌/);
    setup.mockInput.pressArrow("left");
    setup.mockInput.pressKey("o");
    setup.mockInput.pressBackspace();
    await settle(setup);
    specimen.expect(value()).toBe("hi");
    setup.mockInput.pressEnter();
    specimen.expect(submitted).toEqual(["hi"]);
    setup.renderer.destroy();
  });

  specimen.it("a prompt outside turn · line throws", async () => {
    const { prompt } = await parts;
    specimen.expect(() => prompt("bare")).toThrow(/not a prompt: "bare" · turn · line/);
  });
});
