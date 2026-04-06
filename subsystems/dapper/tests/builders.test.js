// Tests for dapper/primitives/builders.js — pure factory primitives.
// No deno tasks defined yet for dapper; run with `deno test -A --no-check
// subsystems/dapper/tests/builders.test.js`.

import { specimen } from "@vivalence/typology";
import {
  pick,
  interactive,
  box,
  skeleton,
} from "../primitives/builders.js";

const sampleRamp = {
  50:  "#fafafa",
  100: "#f0f0f0",
  200: "#e0e0e0",
  300: "#d0d0d0",
  400: "#c0c0c0",
  500: "#b0b0b0",
  600: "#909090",
  700: "#707070",
  800: "#505050",
  850: "#404040",
  900: "#303030",
  950: "#101010",
};

specimen.describe("pick", () => {
  specimen.it("reads a value at the anchor with no middlewares", () => {
    specimen.expect(pick(sampleRamp, 300)).toBe("#d0d0d0");
  });

  specimen.it("pipes value through middlewares left to right", () => {
    const upper = (value) => value.toUpperCase();
    const wrap = (value) => `<${value}>`;
    specimen.expect(pick(sampleRamp, 500, upper, wrap)).toBe("<#B0B0B0>");
  });
});

specimen.describe("interactive", () => {
  specimen.it("returns base/hover/active for a midrange anchor", () => {
    const result = interactive(sampleRamp, 300);
    specimen.expect(result.base).toBe("#d0d0d0");
    specimen.expect(result.hover).toBe("#e0e0e0"); // one stop lighter (200)
    specimen.expect(result.active).toBe("#c0c0c0"); // one stop darker (400)
  });

  specimen.it("walks ramp by sorted keys, not by integer step", () => {
    // 800 → hover should be 700, active should be 850 (next sorted stop).
    const result = interactive(sampleRamp, 800);
    specimen.expect(result.base).toBe("#505050");
    specimen.expect(result.hover).toBe("#707070");
    specimen.expect(result.active).toBe("#404040");
  });

  specimen.it("clamps at the lightest edge", () => {
    const result = interactive(sampleRamp, 50);
    specimen.expect(result.base).toBe("#fafafa");
    specimen.expect(result.hover).toBe("#fafafa"); // can't go lighter
    specimen.expect(result.active).toBe("#f0f0f0");
  });

  specimen.it("clamps at the darkest edge", () => {
    const result = interactive(sampleRamp, 950);
    specimen.expect(result.base).toBe("#101010");
    specimen.expect(result.hover).toBe("#303030");
    specimen.expect(result.active).toBe("#101010"); // can't go darker
  });

  specimen.it("throws on unknown anchor", () => {
    specimen.expect(() => interactive(sampleRamp, 1234)).toThrow();
  });
});

specimen.describe("box", () => {
  specimen.it("returns surface/contrast/boundary triplet with default anchors", () => {
    const result = box(sampleRamp);
    specimen.expect(result.surface).toBe("#505050");  // 800
    specimen.expect(result.contrast).toBe("#f0f0f0"); // 100
    specimen.expect(result.boundary).toBe("#d0d0d0"); // 300
  });

  specimen.it("accepts custom anchors", () => {
    const result = box(sampleRamp, [950, 50, 500]);
    specimen.expect(result.surface).toBe("#101010");
    specimen.expect(result.contrast).toBe("#fafafa");
    specimen.expect(result.boundary).toBe("#b0b0b0");
  });
});

specimen.describe("skeleton", () => {
  const config = {
    surface:  "#000",
    contrast: "#fff",
    boundary: "#888",
    roles: {
      primary: { ramp: sampleRamp, anchor: 300 },
      danger:  { ramp: sampleRamp, anchor: 500 },
    },
    error: { ramp: sampleRamp, anchors: [800, 100, 300] },
    font:  { heading: "h", body: "b", code: "c" },
  };

  specimen.it("preserves structural raw values", () => {
    const result = skeleton(config);
    specimen.expect(result.surface).toBe("#000");
    specimen.expect(result.contrast).toBe("#fff");
    specimen.expect(result.boundary).toBe("#888");
  });

  specimen.it("expands each role into a base/hover/active triplet", () => {
    const result = skeleton(config);
    specimen.expect(result.primary.base).toBe("#d0d0d0");
    specimen.expect(result.primary.hover).toBe("#e0e0e0");
    specimen.expect(result.primary.active).toBe("#c0c0c0");
    specimen.expect(result.danger.base).toBe("#b0b0b0");
  });

  specimen.it("expands the error config into a box triplet", () => {
    const result = skeleton(config);
    specimen.expect(result.error.surface).toBe("#505050");
    specimen.expect(result.error.contrast).toBe("#f0f0f0");
    specimen.expect(result.error.boundary).toBe("#d0d0d0");
  });

  specimen.it("passes font through unchanged", () => {
    const result = skeleton(config);
    specimen.expect(result.font).toEqual({ heading: "h", body: "b", code: "c" });
  });

  specimen.it("omits error and font when not provided", () => {
    const result = skeleton({
      surface:  "#000",
      contrast: "#fff",
      boundary: "#888",
      roles:    { primary: { ramp: sampleRamp, anchor: 300 } },
    });
    specimen.expect(result.error).toBeUndefined();
    specimen.expect(result.font).toBeUndefined();
  });
});
