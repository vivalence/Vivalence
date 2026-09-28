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

specimen.describe("bridge.view — the fold of a rail and the place of its strip", () => {
  specimen.it("a save from before either key boots page · bottom", () => {
    withSaved({ view: { theme: "parchment", f: "buffers", d: "outside", "d.threads": true } }, () => {
      const bridge = new Bridge();
      specimen.expect([bridge.view.fold, bridge.view.strip]).toEqual(["page", "bottom"]);
      specimen.expect(bridge.view.theme).toBe("parchment");
    });
  });

  specimen.it("no save at all boots page · bottom", () => {
    withSaved(null, () => {
      const bridge = new Bridge();
      specimen.expect([bridge.view.fold, bridge.view.strip]).toEqual(["page", "bottom"]);
    });
  });

  specimen.it("a saved stack · top is read back", () => {
    withSaved({ view: { fold: "stack", strip: "top" } }, () => {
      const bridge = new Bridge();
      specimen.expect([bridge.view.fold, bridge.view.strip]).toEqual(["stack", "top"]);
    });
  });

  specimen.it("a value outside the two falls to the default", () => {
    for (const value of ["accordion", "free", "left", "", null, 0, true, ["stack"]]) {
      withSaved({ view: { fold: value, strip: value } }, () => {
        const bridge = new Bridge();
        specimen.expect([value, bridge.view.fold, bridge.view.strip]).toEqual([value, "page", "bottom"]);
      });
    }
  });

  specimen.it("setFold and setStrip write the store and the save, and refuse an unknown name", () => {
    withSaved(null, () => {
      const bridge = new Bridge();
      bridge.setFold("stack");
      bridge.setStrip("top");
      specimen.expect([bridge.view.fold, bridge.view.strip]).toEqual(["stack", "top"]);
      specimen.expect([stored().view.fold, stored().view.strip]).toEqual(["stack", "top"]);
      bridge.setFold("free");
      bridge.setStrip("sideways");
      specimen.expect([bridge.view.fold, bridge.view.strip]).toEqual(["page", "bottom"]);
      specimen.expect([stored().view.fold, stored().view.strip]).toEqual(["page", "bottom"]);
    });
  });

  specimen.it("the save holds the five keys a view reads, and none of the old stack's", () => {
    withSaved({ view: { d: "outside", "d.threads": true, "d.intents": true, "d.modes": true, f: "buffers", theme: "porcelain" } }, () => {
      const bridge = new Bridge();
      bridge.save();
      specimen.expect(Object.keys(stored().view).sort()).toEqual(["fold", "fontSize", "hair", "strip", "theme"]);
      specimen.expect(stored().view.theme).toBe("porcelain");
    });
  });

  specimen.it("the hairline bones and the pin lock survive a reload; the full stage never does", () => {
    withSaved({ locked: true, view: { hair: true, full: true } }, () => {
      const bridge = new Bridge();
      specimen.expect([bridge.view.hair, bridge.layout.locked, bridge.view.full]).toEqual([true, true, false]);
      bridge.view.full = true;
      bridge.save();
      specimen.expect([stored().view.hair, stored().locked, stored().view.full]).toEqual([true, true, undefined]);
    });
  });
});
