import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";
import { oracle, shaped } from "../scenarios/shape.js";

specimen.describe("Toggles — .tg › button.on: every option stands alone, pressed or not", () => {
  specimen.it("the tree; the line rides data-signal and title; aria-pressed says the state; picks on click", () => {
    const picked = [];
    const rig = screen(() =>
      parts.Toggles({
        label: "lens",
        options: ["turns", "repl", "harness"],
        on: ["turns", "harness"],
        signal: (option) => `/dock/lens ${option}`,
        onPick: (option) => picked.push(option),
      }),
    );
    specimen.expect(shaped(rig.target)).toBe(
      oracle(
        `<span class="tg" role="group" aria-label="lens"><button type="button" class="on" aria-pressed="true" title="/dock/lens turns"><i class="tk"></i>turns</button><button type="button" class="" aria-pressed="false" title="/dock/lens repl"><i class="tk"></i>repl</button><button type="button" class="on" aria-pressed="true" title="/dock/lens harness"><i class="tk"></i>harness</button></span>`,
      ),
    );
    const options = [...rig.target.querySelectorAll("button")];
    specimen.expect(options.map((option) => option.getAttribute("data-signal"))).toEqual(["/dock/lens turns", "/dock/lens repl", "/dock/lens harness"]);
    fire(options[1], "click");
    specimen.expect(picked).toEqual(["repl"]);
    rig.close();
  });

  specimen.it("follows a signal: none on is a lawful state", () => {
    const [on, set] = parts.createSignal(["turns"]);
    const rig = screen(() =>
      parts.Toggles({
        options: ["turns", "repl"],
        get on() {
          return on();
        },
      }),
    );
    set(["repl"]);
    specimen.expect([...rig.target.querySelectorAll("button")].map((option) => option.getAttribute("aria-pressed"))).toEqual(["false", "true"]);
    set([]);
    specimen.expect([...rig.target.querySelectorAll("button")].map((option) => option.className)).toEqual(["", ""]);
    rig.close();
  });
});
