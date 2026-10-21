import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";
import { oracle, shaped } from "../scenarios/shape.js";

specimen.describe("Choice — dom.js:67: .cc › button.cur", () => {
  specimen.it("the design's tree; the line rides data-signal and title; picks on click", () => {
    const picked = [];
    const rig = screen(() => parts.Choice({ options: ["frugal", "fast", "capable"], value: "capable", signal: (option) => `/tune ${option}`, onPick: (option) => picked.push(option) }));
    specimen.expect(shaped(rig.target)).toBe(oracle(`<span class="cc"><button class="" title="/tune frugal">frugal</button><button class="" title="/tune fast">fast</button><button class="cur" title="/tune capable">capable</button></span>`));
    const options = [...rig.target.querySelectorAll("button")];
    specimen.expect(options.map((option) => option.getAttribute("data-signal"))).toEqual(["/tune frugal", "/tune fast", "/tune capable"]);
    fire(options[1], "click");
    specimen.expect(picked).toEqual(["fast"]);
    rig.close();
  });

  specimen.it("follows a signal", () => {
    const [value, set] = parts.createSignal("low");
    const rig = screen(() =>
      parts.Choice({
        options: ["low", "high"],
        get value() {
          return value();
        },
      }),
    );
    set("high");
    specimen.expect([...rig.target.querySelectorAll("button")].map((option) => option.className)).toEqual(["", "cur"]);
    rig.close();
  });
});
