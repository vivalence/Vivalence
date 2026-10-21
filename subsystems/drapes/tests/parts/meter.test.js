import { specimen } from "@vivalence/typology";
import { parts, screen } from "../scenarios/index.js";
import { oracle, shaped } from "../scenarios/shape.js";

const lit = (rig) => [...rig.target.querySelectorAll(".meter i")].map((ring) => ring.className === "on");

specimen.describe("Meter — dom.js:44 meter(pct, n, cls): rings over a percent; cau at 85", () => {
  specimen.it("the design's tree and title; lights the rings the percent covers", () => {
    const rig = screen(() => parts.Meter({ pct: 34 }));
    specimen.expect(shaped(rig.target)).toBe(oracle(`<span class="meter " title="context 34 %"><i class="on"></i><i class="on"></i><i class=""></i><i class=""></i><i class=""></i><i class=""></i></span>`));
    specimen.expect(rig.target.querySelector(".meter").getAttribute("title")).toBe("context 34 %");
    specimen.expect(lit(rig)).toEqual([true, true, false, false, false, false]);
    rig.close();
  });

  specimen.it("turns cau at the threshold and follows a signal", () => {
    const [pct, set] = parts.createSignal(50);
    const rig = screen(() =>
      parts.Meter({
        get pct() {
          return pct();
        },
      }),
    );
    specimen.expect(rig.target.querySelector(".meter").className).toBe("meter");
    set(92);
    specimen.expect(rig.target.querySelector(".meter").className).toBe("meter cau");
    specimen.expect(lit(rig)).toEqual([true, true, true, true, true, false]);
    rig.close();
  });

  specimen.it("takes another ring count (the phone's four)", () => {
    const rig = screen(() => parts.Meter({ pct: 100, rings: 4 }));
    specimen.expect(lit(rig)).toEqual([true, true, true, true]);
    rig.close();
  });
});
