import { specimen } from "@vivalence/typology";
import { Bridge, bootLayout, resize } from "../../src/typology/stores/bridge/bridge.js";

const STORAGE_KEY = "vivalence:bridge";

const withSaved = (saved, run) => {
  const held = globalThis.localStorage.getItem(STORAGE_KEY);
  if (saved === null) globalThis.localStorage.removeItem(STORAGE_KEY);
  else globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  try {
    return run();
  } finally {
    if (held === null) globalThis.localStorage.removeItem(STORAGE_KEY);
    else globalThis.localStorage.setItem(STORAGE_KEY, held);
  }
};

specimen.describe("bridge.viewport — home and back carry their turn", () => {
  specimen.it("a home and a back saved without a turn boot on the saved turn; a saved turn survives the boot's clamp", () => {
    withSaved({ pincer: { x: 300, y: 200 }, previous: { x: 100, y: 100 }, standard: { x: 50, y: 700, orientation: 270 }, orientation: 90 }, () => {
      const bridge = new Bridge();
      bootLayout(bridge);
      specimen.expect([bridge.layout.previous.orientation, bridge.layout.standard.orientation]).toEqual([90, 270]);
    });
  });

  specimen.it("a fresh boot gives home and back the boot's turn", () => {
    withSaved(null, () => {
      const bridge = new Bridge();
      bootLayout(bridge);
      specimen.expect([bridge.layout.previous.orientation, bridge.layout.standard.orientation]).toEqual([0, 0]);
    });
  });

  specimen.it("a device rotation moves home and back along with the joint and keeps their turns", () => {
    const bridge = new Bridge();
    Object.assign(bridge.layout, {
      viewport: { width: 1200, height: 800 },
      orientation: 90,
      pincer: { x: 400, y: 300 },
      previous: { x: 500, y: 300, orientation: 180 },
      standard: { x: 22.5, y: 777.5, orientation: 270 },
    });
    const held = Object.getOwnPropertyDescriptor(globalThis, "window");
    Object.defineProperty(globalThis, "window", { value: { innerWidth: 800, innerHeight: 1200 }, configurable: true, writable: true });
    try {
      specimen.expect(resize(bridge)).toBe(true);
    } finally {
      if (held) Object.defineProperty(globalThis, "window", held);
      else delete globalThis.window;
    }
    specimen.expect(bridge.layout.previous).toEqual({ x: 100, y: 300, orientation: 180 });
    specimen.expect(bridge.layout.standard).toEqual({ x: 22.5, y: 777.5, orientation: 270 });
  });
});

specimen.describe("bridge.viewport — resize writes only on change", () => {
  specimen.it("an unchanged viewport writes no store and reports false", () => {
    const bridge = new Bridge();
    const writes = [];
    bridge.layout.$viewport.listen((value) => writes.push(["viewport", value]));
    bridge.layout.$pincer.listen((value) => writes.push(["pincer", value]));
    bridge.$viewportOffsetTop.listen((value) => writes.push(["offsetTop", value]));

    specimen.expect(resize(bridge)).toBe(false);
    specimen.expect(resize(bridge)).toBe(false);
    specimen.expect(writes).toEqual([]);
  });

  specimen.it("a changed viewport writes once and reports true; an already-clamped pincer stays silent", () => {
    const bridge = new Bridge();
    bridge.layout.viewport = { width: 390, height: 700 };
    const writes = [];
    bridge.layout.$viewport.listen((value) => writes.push(["viewport", value]));
    bridge.layout.$pincer.listen((value) => writes.push(["pincer", value]));

    specimen.expect(resize(bridge)).toBe(true);
    specimen.expect(writes.map(([store]) => store)).toEqual(["viewport", "pincer"]);
    specimen.expect(writes[0][1]).toEqual({ width: 0, height: 0 });
    specimen.expect(resize(bridge)).toBe(false);
    specimen.expect(writes.length).toBe(2);
  });
});
