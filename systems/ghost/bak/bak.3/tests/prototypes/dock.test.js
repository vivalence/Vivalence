import { specimen } from "@vivalence/typology";
import {
  DOCK_SIDES,
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
  snapAfterDrop,
  defaultDock,
  setDockSide,
  setDockShare,
  setDockCollapsed,
  setDockFull,
  dragDock,
  dropDock,
  DEFAULT_DOCK,
} from "../../gestalten/belt/dock.js";
import { atom } from "nanostores";

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
    const dock = { side: "right", share: 0.25 };
    const out = resolve(dock, rect);
    specimen.expect(out.side).toBe("right");
    specimen.expect(out.vertical).toBe(true);
    specimen.expect(out.share).toBe(0.25);
    specimen.expect(out.direction).toBe("row");
    specimen.expect(out.dimension).toBe(1000);
    specimen.expect(out.size).toBe(250);
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
    const out = resolve({ side: "bottom", share: 0.5 }, rect);
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

  specimen.it("a drop within 72 px of the floor shuts the dock, within 72 px of the ceiling fills it, between keeps the share; a snap resets the share", () => {
    const rect = { width: 1000, height: 600 };
    specimen.expect(snapAfterDrop({ side: "right", share: 0.2, rect })).toEqual({ share: SHARE_DEFAULT, collapsed: true });
    specimen.expect(snapAfterDrop({ side: "right", share: 0.26, rect })).toEqual({ share: 0.26 });
    specimen.expect(snapAfterDrop({ side: "right", share: 0.95, rect })).toEqual({ share: SHARE_DEFAULT, full: true });
    specimen.expect(snapAfterDrop({ side: "bottom", share: 0.3, rect })).toEqual({ share: SHARE_DEFAULT, collapsed: true });
    specimen.expect(snapAfterDrop({ side: "right", share: 0.3, rect: { width: 0, height: 0 } })).toEqual({ share: 0.3 });
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

specimen.describe("dock — the store writers over a terminal's $dock", () => {
  specimen.it("defaultDock hands out its own copy of DEFAULT_DOCK", () => {
    const first = defaultDock();
    first.side = "left";
    specimen.expect(DEFAULT_DOCK.side).toBe("right");
    specimen.expect(defaultDock()).toEqual(DEFAULT_DOCK);
  });

  specimen.it("setDockSide normalizes, setDockShare clamps, both keep the other keys", () => {
    const $dock = atom(defaultDock());
    setDockSide($dock, "top");
    setDockShare($dock, 4);
    specimen.expect($dock.get()).toEqual({ side: "top", share: SHARE_MAX, collapsed: true, full: false });
    setDockSide($dock, "diagonal");
    specimen.expect($dock.get().side).toBe("right");
  });

  specimen.it("setDockCollapsed and setDockFull toggle when no value is handed, set when one is", () => {
    const $dock = atom(defaultDock());
    setDockCollapsed($dock);
    specimen.expect($dock.get().collapsed).toBe(false);
    setDockCollapsed($dock, false);
    specimen.expect($dock.get().collapsed).toBe(false);
    setDockFull($dock);
    specimen.expect($dock.get().full).toBe(true);
    setDockFull($dock, false);
    specimen.expect($dock.get().full).toBe(false);
  });

  specimen.it("dragDock moves the share by the drag over the rect, dropDock snaps near either bound", () => {
    const rect = { width: 1000, height: 800 };
    const $dock = atom({ side: "right", share: 0.4, collapsed: false, full: false });
    dragDock($dock, rect, -100);
    specimen.expect($dock.get().share).toBeCloseTo(0.5);
    $dock.set({ ...$dock.get(), share: SHARE_MIN + 0.01 });
    dropDock($dock, rect);
    specimen.expect($dock.get()).toEqual({ side: "right", share: SHARE_DEFAULT, collapsed: true, full: false });
    $dock.set({ side: "right", share: SHARE_MAX - 0.01, collapsed: false, full: false });
    dropDock($dock, rect);
    specimen.expect($dock.get()).toEqual({ side: "right", share: SHARE_DEFAULT, collapsed: false, full: true });
    $dock.set({ side: "right", share: 0.5, collapsed: false, full: false });
    dropDock($dock, rect);
    specimen.expect($dock.get().share).toBe(0.5);
  });

  specimen.it("every writer is a no-op on an absent store", () => {
    for (const write of [setDockSide, setDockShare, setDockCollapsed, setDockFull]) specimen.expect(write(null, "left")).toBe(undefined);
    specimen.expect(dragDock(null, { width: 1, height: 1 }, 1)).toBe(undefined);
    specimen.expect(dropDock(null, { width: 1, height: 1 })).toBe(undefined);
  });
});
