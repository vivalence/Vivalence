import { specimen } from "@vivalence/typology";
import { Bridge } from "../src/typology/stores/bridge/bridge.js";

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

const stored = () => JSON.parse(globalThis.localStorage.getItem(STORAGE_KEY));

specimen.describe("bridge.view — the place of the strip", () => {
  specimen.it("a save from before the key boots bottom", () => {
    withSaved({ view: { theme: "parchment", f: "buffers", d: "outside", "d.threads": true } }, () => {
      const bridge = new Bridge();
      specimen.expect(bridge.view.strip).toBe("bottom");
      specimen.expect(bridge.view.theme).toBe("parchment");
    });
  });

  specimen.it("no save at all boots bottom", () => {
    withSaved(null, () => {
      const bridge = new Bridge();
      specimen.expect(bridge.view.strip).toBe("bottom");
    });
  });

  specimen.it("a saved top is read back", () => {
    withSaved({ view: { strip: "top" } }, () => {
      const bridge = new Bridge();
      specimen.expect(bridge.view.strip).toBe("top");
    });
  });

  specimen.it("a value outside the two falls to the default", () => {
    for (const value of ["accordion", "free", "left", "", null, 0, true, ["stack"]]) {
      withSaved({ view: { strip: value } }, () => {
        const bridge = new Bridge();
        specimen.expect([value, bridge.view.strip]).toEqual([value, "bottom"]);
      });
    }
  });

  specimen.it("setStrip writes the store and the save, and refuses an unknown name", () => {
    withSaved(null, () => {
      const bridge = new Bridge();
      bridge.setStrip("top");
      specimen.expect([bridge.view.strip, stored().view.strip]).toEqual(["top", "top"]);
      bridge.setStrip("sideways");
      specimen.expect([bridge.view.strip, stored().view.strip]).toEqual(["bottom", "bottom"]);
    });
  });

  specimen.it("the save holds the five keys a view reads, and none of the old stack's", () => {
    withSaved({ view: { d: "outside", "d.threads": true, "d.intents": true, "d.modes": true, f: "buffers", theme: "porcelain" } }, () => {
      const bridge = new Bridge();
      bridge.save();
      specimen.expect(Object.keys(stored().view).sort()).toEqual(["fontSize", "hair", "strip", "theme"]);
      specimen.expect(stored().view.theme).toBe("porcelain");
    });
  });

  specimen.it("the hairline bones survive a reload; the full stage never does", () => {
    withSaved({ view: { hair: true, full: true } }, () => {
      const bridge = new Bridge();
      specimen.expect([bridge.view.hair, bridge.view.full]).toEqual([true, false]);
      bridge.view.full = true;
      bridge.save();
      specimen.expect([stored().view.hair, stored().view.full]).toEqual([true, undefined]);
    });
  });
});
