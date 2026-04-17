import { specimen } from "@vivalence/typology";
import {
  DOCK_SIDES,
  RAIL_SIZE,
  SHARE_MIN,
  SHARE_MAX,
  SHARE_DEFAULT,
  clampShare,
  normalizeSide,
  isVertical,
  flexDirection,
  dragSign,
  resolve,
  shareAfterDrag,
  defaultDock,
} from "../../src/routes/pincer/panels/a/dock.geometry.js";

specimen.describe("dock.geometry — constraint invariants", () => {
  specimen.it("clampShare bounds every input into [SHARE_MIN, SHARE_MAX]", () => {
    specimen.expect(clampShare(-1)).toBe(SHARE_MIN);
    specimen.expect(clampShare(0)).toBe(SHARE_MIN);
    specimen.expect(clampShare(SHARE_MIN - 0.01)).toBe(SHARE_MIN);
    specimen.expect(clampShare(SHARE_MIN)).toBe(SHARE_MIN);
    specimen.expect(clampShare(0.4)).toBe(0.4);
    specimen.expect(clampShare(SHARE_MAX)).toBe(SHARE_MAX);
    specimen.expect(clampShare(SHARE_MAX + 0.01)).toBe(SHARE_MAX);
    specimen.expect(clampShare(99)).toBe(SHARE_MAX);
    specimen.expect(clampShare(NaN)).toBe(SHARE_DEFAULT);
    specimen.expect(clampShare(undefined)).toBe(SHARE_DEFAULT);
  });

  specimen.it("normalizeSide accepts only the enum, else 'right'", () => {
    for (const side of DOCK_SIDES) specimen.expect(normalizeSide(side)).toBe(side);
    specimen.expect(normalizeSide("diagonal")).toBe("right");
    specimen.expect(normalizeSide(undefined)).toBe("right");
    specimen.expect(normalizeSide(null)).toBe("right");
  });

  specimen.it("isVertical partitions sides into horizontal/vertical", () => {
    specimen.expect(isVertical("left")).toBe(true);
    specimen.expect(isVertical("right")).toBe(true);
    specimen.expect(isVertical("top")).toBe(false);
    specimen.expect(isVertical("bottom")).toBe(false);
  });

  specimen.it("flexDirection maps every side to the chat-on-the-correct-edge value", () => {
    specimen.expect(flexDirection("right")).toBe("row");
    specimen.expect(flexDirection("left")).toBe("row-reverse");
    specimen.expect(flexDirection("bottom")).toBe("column");
    specimen.expect(flexDirection("top")).toBe("column-reverse");
  });

  specimen.it("dragSign inverts by side so drag-inward always shrinks the body", () => {
    specimen.expect(dragSign("right")).toBe(-1);
    specimen.expect(dragSign("bottom")).toBe(-1);
    specimen.expect(dragSign("left")).toBe(1);
    specimen.expect(dragSign("top")).toBe(1);
  });

  specimen.it("resolve yields consistent geometry for a live dock+rect", () => {
    const rect = { width: 1000, height: 800 };
    const dock = { side: "right", share: 0.25, collapsed: false };
    const out = resolve(dock, rect);
    specimen.expect(out.side).toBe("right");
    specimen.expect(out.vertical).toBe(true);
    specimen.expect(out.share).toBe(0.25);
    specimen.expect(out.direction).toBe("row");
    specimen.expect(out.dimension).toBe(1000);
    specimen.expect(out.size).toBe(250);
  });

  specimen.it("resolve collapses size to RAIL_SIZE regardless of share", () => {
    const rect = { width: 1000, height: 800 };
    const out = resolve({ side: "right", share: 0.5, collapsed: true }, rect);
    specimen.expect(out.size).toBe(RAIL_SIZE);
  });

  specimen.it("resolve defends against invalid dock (undefined, bad side, NaN share)", () => {
    const rect = { width: 1000, height: 800 };
    const out = resolve(undefined, rect);
    specimen.expect(out.side).toBe("right");
    specimen.expect(out.share).toBe(SHARE_DEFAULT);
    specimen.expect(out.direction).toBe("row");
  });

  specimen.it("resolve switches axis for horizontal sides", () => {
    const rect = { width: 1000, height: 800 };
    const out = resolve({ side: "bottom", share: 0.5, collapsed: false }, rect);
    specimen.expect(out.vertical).toBe(false);
    specimen.expect(out.direction).toBe("column");
    specimen.expect(out.dimension).toBe(800);
    specimen.expect(out.size).toBe(400);
  });

  specimen.it("shareAfterDrag moves inward on positive delta for right/bottom, outward for left/top", () => {
    const rect = { width: 1000, height: 800 };
    specimen.expect(shareAfterDrag({ side: "right", share: 0.3, rect, deltaPx: -100 })).toBeCloseTo(0.4, 5);
    specimen.expect(shareAfterDrag({ side: "right", share: 0.3, rect, deltaPx: 100 })).toBeCloseTo(0.2, 5);
    specimen.expect(shareAfterDrag({ side: "left", share: 0.3, rect, deltaPx: 100 })).toBeCloseTo(0.4, 5);
    specimen.expect(shareAfterDrag({ side: "top", share: 0.3, rect, deltaPx: 80 })).toBeCloseTo(0.4, 5);
  });

  specimen.it("shareAfterDrag stays inside [SHARE_MIN, SHARE_MAX] even for huge deltas", () => {
    const rect = { width: 1000, height: 800 };
    specimen.expect(shareAfterDrag({ side: "right", share: 0.3, rect, deltaPx: -9999 })).toBe(SHARE_MAX);
    specimen.expect(shareAfterDrag({ side: "right", share: 0.3, rect, deltaPx: 9999 })).toBe(SHARE_MIN);
  });

  specimen.it("shareAfterDrag ignores zero-dimension rects (keeps share)", () => {
    specimen.expect(shareAfterDrag({ side: "right", share: 0.3, rect: { width: 0, height: 0 }, deltaPx: 50 })).toBe(0.3);
  });

  specimen.it("defaultDock is a valid dock (passes resolve() unchanged)", () => {
    const rect = { width: 1000, height: 800 };
    const dock = defaultDock();
    const out = resolve(dock, rect);
    specimen.expect(DOCK_SIDES.includes(out.side)).toBe(true);
    specimen.expect(out.share).toBeGreaterThanOrEqual(SHARE_MIN);
    specimen.expect(out.share).toBeLessThanOrEqual(SHARE_MAX);
  });
});
