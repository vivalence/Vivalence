import { specimen } from "@vivalence/typology";
import { blend, channels, contrast, flatten, hex, luminance, wash } from "../lib/contrast.js";
import { THEMES } from "../themes/index.js";

const SIGNALS = ["primary", "positive", "caution", "negative"];
const DEPTHS = ["surface", "surfaceSunk", "surfaceLift"];
const PROSE = ["header", "strong", "ink", "light", "link", "code"];
const near = (got, wanted) => Math.abs(got - wanted) < 0.01;

specimen.describe("contrast — the measure", () => {
  specimen.it("black on white is 21, a colour on itself is 1", () => {
    specimen.expect(near(contrast("#000000", "#FFFFFF"), 21)).toBe(true);
    specimen.expect(contrast("#6B7E91", "#6B7E91")).toBe(1);
  });

  specimen.it("the order of the pair never matters", () => {
    specimen.expect(contrast("#1A2A38", "#B4BFCB")).toBe(contrast("#B4BFCB", "#1A2A38"));
  });

  specimen.it("known pairs", () => {
    const pairs = [
      ["#767676", "#FFFFFF", 4.54],
      ["#777777", "#FFFFFF", 4.48],
      ["#FF0000", "#FFFFFF", 4.0],
      ["#0000FF", "#FFFFFF", 8.59],
    ];
    for (const [first, second, wanted] of pairs) specimen.expect([first, near(contrast(first, second), wanted)]).toEqual([first, true]);
  });

  specimen.it("the quest's measurements re-measure", () => {
    specimen.expect(near(contrast("#6B7E91", "#1A2A38"), 3.5)).toBe(true);
    specimen.expect(near(contrast("#F4F6F9", "#BE7055"), 3.44)).toBe(true);
    specimen.expect(near(contrast("#060D14", "#BE7055"), 5.24)).toBe(true);
    specimen.expect(near(contrast("#FBFAF2", "#C74E31"), 4.4)).toBe(true);
    specimen.expect(near(contrast("#FBFAF2", "#A23920"), 6.38)).toBe(true);
  });

  specimen.it("luminance runs 0 to 1", () => {
    specimen.expect([luminance("#000000"), luminance("#FFFFFF")]).toEqual([0, 1]);
  });

  specimen.it("channels reads a hex and an rgba, and refuses the rest", () => {
    specimen.expect(channels("#1A2A38")).toEqual([26, 42, 56, 1]);
    specimen.expect(channels("rgba(30, 188, 181, 0.18)")).toEqual([30, 188, 181, 0.18]);
    for (const held of ["red", "#FFF", "rgb(0, 0, 0)", "", undefined, 7]) specimen.expect(() => channels(held)).toThrow("not a colour");
  });

  specimen.it("hex, wash, blend and flatten", () => {
    specimen.expect(hex([26, 42, 56])).toBe("#1A2A38");
    specimen.expect(wash("#1EBCB5", 0.18)).toBe("rgba(30, 188, 181, 0.18)");
    specimen.expect(blend("#000000", "#FFFFFF", 0.5)).toBe("#808080");
    specimen.expect(blend("#FFFFFF", "#000000", 0.25)).toBe("#BFBFBF");
    specimen.expect(flatten("rgba(0, 0, 0, 0.5)", "#FFFFFF")).toBe("#808080");
    specimen.expect(flatten("#1A2A38", "#FFFFFF")).toBe("#1A2A38");
  });
});

for (const [name, held] of Object.entries(THEMES)) {
  specimen.describe(`contrast — ${name}, every zone × depth step`, () => {
    held.zones.forEach((zone, index) => {
      for (const depth of DEPTHS) {
        const under = zone[depth];

        specimen.it(`zone ${index} ${depth}: prose steps, link and code clear 4.5`, () => {
          for (const step of PROSE) {
            const ratio = contrast(zone.text[step], under);
            specimen.expect([step, ratio >= 4.5, ratio.toFixed(2)]).toEqual([step, true, ratio.toFixed(2)]);
          }
        });

        specimen.it(`zone ${index} ${depth}: muted clears 3`, () => {
          const ratio = contrast(zone.text.muted, under);
          specimen.expect([ratio >= 3, ratio.toFixed(2)]).toEqual([true, ratio.toFixed(2)]);
        });

        specimen.it(`zone ${index} ${depth}: every signal ink clears 4.5`, () => {
          for (const signal of SIGNALS) {
            const ratio = contrast(zone.signal[signal].ink, under);
            specimen.expect([signal, ratio >= 4.5, ratio.toFixed(2)]).toEqual([signal, true, ratio.toFixed(2)]);
          }
        });

        specimen.it(`zone ${index} ${depth}: every signal ink clears 4.5 on its own tint laid over the ground`, () => {
          for (const signal of SIGNALS) {
            const ratio = contrast(zone.signal[signal].ink, flatten(zone.signal[signal].tint, under));
            specimen.expect([signal, ratio >= 4.5, ratio.toFixed(2)]).toEqual([signal, true, ratio.toFixed(2)]);
          }
        });

        specimen.it(`zone ${index} ${depth}: the focus ring clears 3`, () => {
          const ratio = contrast(zone.control.focus, under);
          specimen.expect([ratio >= 3, ratio.toFixed(2)]).toEqual([true, ratio.toFixed(2)]);
        });
      }

      specimen.it(`zone ${index}: a glyph on a fill clears 4.5 — signals, keys, the inverted block`, () => {
        const pairs = [
          ...SIGNALS.map((signal) => [`signal.${signal}.on`, zone.signal[signal].on, zone.signal[signal].fill]),
          ["control.on", zone.control.on, zone.control.contrast],
          ["control.on / hover", zone.control.on, zone.control.contrastHover],
          ["control.onPressed", zone.control.onPressed, zone.control.contrastPressed],
          ["inverseOn", zone.inverseOn, zone.inverse],
          ["text.strong in a field", zone.text.strong, zone.control.field],
        ];
        for (const [key, glyph, fill] of pairs) {
          const ratio = contrast(glyph, fill);
          specimen.expect([key, ratio >= 4.5, ratio.toFixed(2)]).toEqual([key, true, ratio.toFixed(2)]);
        }
      });

      specimen.it(`zone ${index}: secondary glyphs clear 3 — the muted label on a key, the placeholder in a field`, () => {
        const pairs = [
          ["control.onMuted", zone.control.onMuted, zone.control.contrast],
          ["control.fieldPlaceholder", zone.control.fieldPlaceholder, zone.control.field],
        ];
        for (const [key, glyph, fill] of pairs) {
          const ratio = contrast(glyph, fill);
          specimen.expect([key, ratio >= 3, ratio.toFixed(2)]).toEqual([key, true, ratio.toFixed(2)]);
        }
      });
    });
  });
}
