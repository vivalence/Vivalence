import { specimen } from "@vivalence/typology";
import {
  DEFAULT,
  FOLDS,
  PANE_BAR,
  PANE_HEAD,
  PANE_MIN,
  PANE_NAMES,
  RATIO_MAX,
  RATIO_MIN,
  arrange,
  available,
  insert,
  landing,
  latched,
  layout,
  leaves,
  move,
  open,
  prune,
  remove,
  restore,
  setRatio,
  shown,
  solo,
  swap,
  tap,
  under,
  zone,
} from "../../src/typology/stores/bridge/panes.js";
import { Bridge } from "../../src/typology/stores/bridge/bridge.js";

const STORAGE_KEY = "vivalence:bridge";
const WHOLE = { x: 0, y: 0, w: 100, h: 100 };

const leaf = (pane) => ({ type: "leaf", pane });
const terminal = open(null, "terminal");
const two = open(terminal, "thread");
const three = open(two, "buffer");
const witness = { type: "split", dir: "v", ratio: 0.5, a: leaf("terminal"), b: leaf("thread") };
const frozen = JSON.stringify(three);

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

specimen.describe("panes — the names and the measures", () => {
  specimen.it("six panes, four folds, a head under a bar, a ratio inside its bounds", () => {
    specimen.expect(PANE_NAMES).toEqual(["terminal", "navigation", "thread", "mode", "buffer", "harness"]);
    specimen.expect(FOLDS).toEqual(["page", "stack", "accordion", "free"]);
    specimen.expect([PANE_BAR, PANE_HEAD, PANE_MIN]).toEqual([44, 32, 60]);
    specimen.expect([RATIO_MIN, RATIO_MAX]).toEqual([0.15, 0.85]);
  });
});

specimen.describe("panes — the tree: open · remove · swap · insert · move", () => {
  specimen.it("open on nothing is a leaf", () => {
    specimen.expect(terminal).toEqual(leaf("terminal"));
  });

  specimen.it("open sets the second pane under the first at a half", () => {
    specimen.expect(two).toEqual(witness);
  });

  specimen.it("open splits the root against its grain", () => {
    specimen.expect([three.dir, leaves(three)]).toEqual(["h", ["terminal", "thread", "buffer"]]);
  });

  specimen.it("open sets terminals on top at .3", () => {
    specimen.expect(open(leaf("thread"), "terminal")).toEqual({ type: "split", dir: "v", ratio: 0.3, a: leaf("terminal"), b: leaf("thread") });
  });

  specimen.it("open leaves a pane already open where it is", () => {
    specimen.expect(open(three, "thread")).toBe(three);
  });

  specimen.it("remove collapses the split that held the pane", () => {
    specimen.expect(remove(three, "thread")).toEqual({ type: "split", dir: "h", ratio: 0.5, a: leaf("terminal"), b: leaf("buffer") });
  });

  specimen.it("remove of the last pane leaves nothing, and nothing has no leaves", () => {
    specimen.expect(remove(terminal, "terminal")).toBe(null);
    specimen.expect(remove(null, "terminal")).toBe(null);
    specimen.expect(leaves(null)).toEqual([]);
  });

  specimen.it("swap trades two panes and keeps every split", () => {
    const swapped = swap(three, "terminal", "buffer");
    specimen.expect(leaves(swapped)).toEqual(["buffer", "thread", "terminal"]);
    specimen.expect([swapped.dir, swapped.ratio, swapped.a.dir, swapped.a.ratio]).toEqual([three.dir, three.ratio, three.a.dir, three.a.ratio]);
  });

  specimen.it("insert sets a pane beside its target, on the edge named", () => {
    specimen.expect(insert(terminal, "terminal", "mode", "left")).toEqual({ type: "split", dir: "h", ratio: 0.5, a: leaf("mode"), b: leaf("terminal") });
    specimen.expect(insert(terminal, "terminal", "mode", "right")).toEqual({ type: "split", dir: "h", ratio: 0.5, a: leaf("terminal"), b: leaf("mode") });
    specimen.expect(insert(terminal, "terminal", "mode", "top")).toEqual({ type: "split", dir: "v", ratio: 0.5, a: leaf("mode"), b: leaf("terminal") });
    specimen.expect(insert(terminal, "terminal", "mode", "bottom")).toEqual({ type: "split", dir: "v", ratio: 0.5, a: leaf("terminal"), b: leaf("mode") });
    specimen.expect(insert(null, "terminal", "mode", "left")).toEqual(leaf("mode"));
  });

  specimen.it("move to an edge takes the pane out and sets it beside", () => {
    specimen.expect(leaves(move(three, "buffer", "terminal", "top"))).toEqual(["buffer", "terminal", "thread"]);
    specimen.expect(leaves(move(open(witness, "buffer"), "buffer", "terminal", "top"))).toEqual(["buffer", "terminal", "thread"]);
  });

  specimen.it("move to the core swaps", () => {
    specimen.expect(leaves(move(three, "buffer", "terminal", "center"))).toEqual(["buffer", "thread", "terminal"]);
  });
});

specimen.describe("panes — the ratio, the solo, the drop zone", () => {
  specimen.it("a ratio outside [.15, .85] clamps, a path reaches the split it names", () => {
    specimen.expect([setRatio(two, "", 0.99).ratio, setRatio(two, "", 0.01).ratio, setRatio(three, "a", 0.4).a.ratio]).toEqual([0.85, 0.15, 0.4]);
    specimen.expect(setRatio(three, "a", 0.4).ratio).toBe(three.ratio);
  });

  specimen.it("solo keeps the tree it left and gives it back", () => {
    const alone = solo(three, "thread", null);
    specimen.expect(alone).toEqual({ tree: leaf("thread"), previous: three });
    const back = solo(alone.tree, "thread", alone.previous);
    specimen.expect(back).toEqual({ tree: three, previous: null });
  });

  specimen.it("solo of a lone pane with nothing kept stays alone", () => {
    specimen.expect(solo(leaf("thread"), "thread", null)).toEqual({ tree: leaf("thread"), previous: leaf("thread") });
  });

  specimen.it("the middle 40 % of a pane, both ways, is the core; outside it the nearest edge rules", () => {
    specimen.expect([
      zone(WHOLE, 50, 50),
      zone(WHOLE, 10, 50),
      zone({ x: 0, y: 50, w: 100, h: 50 }, 50, 95),
      zone(WHOLE, 69, 31),
      zone(WHOLE, 71, 50),
      zone(WHOLE, 50, 5),
    ]).toEqual(["center", "left", "bottom", "center", "right", "top"]);
  });
});

specimen.describe("panes — the drop: the pane under the pointer and where the pane lands", () => {
  specimen.it("under finds the leaf that holds the point, and nothing outside every leaf", () => {
    const held = layout(three).leaves;
    specimen.expect([under(held, 10, 10).pane, under(held, 10, 90).pane, under(held, 90, 50).pane]).toEqual(["terminal", "thread", "buffer"]);
    specimen.expect(under(held, 120, 50)).toBe(null);
    specimen.expect(under([], 50, 50)).toBe(null);
  });

  specimen.it("an edge lands on its half of the pane, the core on its middle 60 %", () => {
    const rect = { x: 50, y: 0, w: 50, h: 100 };
    specimen.expect(landing(rect, "left")).toEqual({ x: 50, y: 0, w: 25, h: 100 });
    specimen.expect(landing(rect, "right")).toEqual({ x: 75, y: 0, w: 25, h: 100 });
    specimen.expect(landing(rect, "top")).toEqual({ x: 50, y: 0, w: 50, h: 50 });
    specimen.expect(landing(rect, "bottom")).toEqual({ x: 50, y: 50, w: 50, h: 50 });
    specimen.expect(landing(rect, "center")).toEqual({ x: 60, y: 20, w: 30, h: 60 });
  });

  specimen.it("every zone a point can fall in has a landing", () => {
    for (const [x, y] of [[50, 50], [5, 50], [95, 50], [50, 5], [50, 95]]) {
      const held = landing(WHOLE, zone(WHOLE, x, y));
      specimen.expect([x, y, held.w > 0 && held.h > 0]).toEqual([x, y, true]);
    }
  });
});

specimen.describe("panes — the strip's tap", () => {
  specimen.it("a tap on a parked pane opens it and shows it, in every fold", () => {
    for (const fold of FOLDS) {
      const patch = tap({ tree: two, fold }, "buffer");
      specimen.expect([fold, leaves(patch.tree), patch.expanded]).toEqual([fold, ["terminal", "thread", "buffer"], "buffer"]);
    }
    specimen.expect(tap({ tree: null, fold: "page" }, "terminal")).toEqual({ tree: leaf("terminal"), expanded: "terminal" });
  });

  specimen.it("a tap on an open pane shows it in page and accordion, parks it in stack and free", () => {
    specimen.expect(tap({ tree: three, fold: "page" }, "thread")).toEqual({ expanded: "thread" });
    specimen.expect(tap({ tree: three, fold: "accordion" }, "thread")).toEqual({ expanded: "thread" });
    specimen.expect(leaves(tap({ tree: three, fold: "stack" }, "thread").tree)).toEqual(["terminal", "buffer"]);
    specimen.expect(leaves(tap({ tree: three, fold: "free" }, "thread").tree)).toEqual(["terminal", "buffer"]);
    specimen.expect(tap({ tree: terminal, fold: "free" }, "terminal")).toEqual({ tree: null });
  });

  specimen.it("a key is latched by the pane shown in page and accordion, by every open pane in stack and free", () => {
    const lit = (fold, expanded) => PANE_NAMES.filter((pane) => latched({ tree: three, fold, expanded }, pane));
    specimen.expect(lit("page", "thread")).toEqual(["thread"]);
    specimen.expect(lit("accordion", "harness")).toEqual(["terminal"]);
    specimen.expect(lit("stack", "thread")).toEqual(["terminal", "thread", "buffer"]);
    specimen.expect(lit("free", "thread")).toEqual(["terminal", "thread", "buffer"]);
  });

  specimen.it("shown is the pane named when it is open, else the first, else nothing", () => {
    specimen.expect([shown(three, "buffer"), shown(three, "mode"), shown(null, "mode")]).toEqual(["buffer", "terminal", null]);
  });
});

specimen.describe("panes — layout and the four folds", () => {
  specimen.it("layout draws the witness: two leaves and one seam", () => {
    specimen.expect(layout(witness)).toEqual({
      leaves: [
        { pane: "terminal", x: 0, y: 0, w: 100, h: 50, path: "a" },
        { pane: "thread", x: 0, y: 50, w: 100, h: 50, path: "b" },
      ],
      splits: [{ path: "", dir: "v", x: 0, y: 50, w: 100, parent: WHOLE }],
    });
  });

  specimen.it("layout sums to the rect", () => {
    const area = layout(three).leaves.reduce((total, held) => total + held.w * held.h, 0);
    specimen.expect(area).toBe(10000);
    const skewed = setRatio(setRatio(three, "", 0.37), "a", 0.62);
    specimen.expect(Math.round(layout(skewed).leaves.reduce((total, held) => total + held.w * held.h, 0))).toBe(10000);
  });

  specimen.it("layout names every leaf by its path, and nothing draws nothing", () => {
    specimen.expect(layout(three).leaves.map((held) => held.path)).toEqual(["aa", "ab", "b"]);
    specimen.expect(layout(three).splits.map((seam) => [seam.path, seam.dir])).toEqual([["a", "v"], ["", "h"]]);
    specimen.expect(layout(null)).toEqual({ leaves: [], splits: [] });
  });

  specimen.it("page draws one pane, whole", () => {
    specimen.expect(arrange(witness, "page", "thread")).toEqual({ leaves: [{ pane: "thread", x: 0, y: 0, w: 100, h: 100 }], splits: [] });
    specimen.expect(arrange(null, "page", "thread")).toEqual({ leaves: [], splits: [] });
  });

  specimen.it("page falls to the first pane when the one named is not open", () => {
    specimen.expect(arrange(three, "page", "harness").leaves[0].pane).toBe("terminal");
  });

  specimen.it("stack draws every pane in a column at its own height", () => {
    specimen.expect(arrange(witness, "stack", "thread", { thread: 240 })).toEqual({
      leaves: [
        { pane: "terminal", flow: true, height: null },
        { pane: "thread", flow: true, height: 240 },
      ],
      splits: [],
    });
  });

  specimen.it("accordion draws every head and one body: above counts the heads over a pane, below the heads from the floor", () => {
    specimen.expect(arrange(witness, "accordion", "thread")).toEqual({
      leaves: [
        { pane: "terminal", folded: true, heads: 1, above: 0, below: null },
        { pane: "thread", folded: false, heads: 1, above: 1, below: null },
      ],
      splits: [],
    });
    specimen.expect(arrange(three, "accordion", "thread").leaves).toEqual([
      { pane: "terminal", folded: true, heads: 2, above: 0, below: null },
      { pane: "thread", folded: false, heads: 2, above: 1, below: null },
      { pane: "buffer", folded: true, heads: 2, above: null, below: 1 },
    ]);
  });

  specimen.it("free draws the tree as it is", () => {
    specimen.expect(arrange(three, "free", "thread")).toEqual(layout(three));
  });
});

specimen.describe("panes — what a terminal can show", () => {
  specimen.it("no terminal shows the terminals pane alone", () => {
    specimen.expect(available({})).toEqual({ terminal: true, navigation: false, thread: false, mode: false, buffer: false, harness: false });
  });

  specimen.it("a harnessed thread with no buffer and no application shows all but the buffer", () => {
    specimen.expect(available({ terminals: 1, thread: true, harnessed: true })).toEqual({ terminal: true, navigation: true, thread: true, mode: true, buffer: false, harness: true });
  });

  specimen.it("a buffer or an application opens the buffer pane, and only on a thread", () => {
    specimen.expect(available({ terminals: 1, thread: true, buffers: 2 }).buffer).toBe(true);
    specimen.expect(available({ terminals: 1, thread: true, application: true }).buffer).toBe(true);
    specimen.expect(available({ terminals: 1, buffers: 2, application: true, harnessed: true })).toEqual({ terminal: true, navigation: true, thread: false, mode: false, buffer: false, harness: false });
  });

  specimen.it("prune removes what the terminal cannot show", () => {
    specimen.expect(leaves(prune(three, available({ terminals: 1 })))).toEqual(["terminal"]);
    specimen.expect(prune(three, available({ terminals: 1, thread: true, buffers: 1 }))).toBe(three);
  });
});

specimen.describe("panes — the save", () => {
  specimen.it("the default sets terminals over navigation at .3, in the page fold", () => {
    specimen.expect([DEFAULT.tree.ratio, leaves(DEFAULT.tree), DEFAULT.fold, DEFAULT.expanded]).toEqual([0.3, ["terminal", "navigation"], "page", "terminal"]);
  });

  specimen.it("a save of three arrays boots the default", () => {
    specimen.expect(restore({ open: [true, true, true], fold: [false, false, false], weight: [1, 1, 1] })).toEqual({
      tree: { type: "split", dir: "v", ratio: 0.3, a: leaf("terminal"), b: leaf("navigation") },
      fold: "page",
      expanded: "terminal",
      heights: {},
      previous: null,
    });
  });

  specimen.it("a save naming an unknown pane or an unknown fold boots the default", () => {
    specimen.expect(restore({ tree: leaf("instance"), fold: "page" })).toEqual(DEFAULT);
    specimen.expect(restore({ tree: three, fold: "twig" })).toEqual(DEFAULT);
    specimen.expect(restore(null)).toEqual(DEFAULT);
    specimen.expect(restore(undefined)).toEqual(DEFAULT);
  });

  specimen.it("a save holding a tree of known panes and a known fold is read back", () => {
    specimen.expect(restore({ tree: three, fold: "free", expanded: "buffer", heights: { buffer: 200 } })).toEqual({
      tree: three,
      fold: "free",
      expanded: "buffer",
      heights: { buffer: 200 },
      previous: null,
    });
    specimen.expect(restore({ tree: three, fold: "stack" })).toEqual({ tree: three, fold: "stack", expanded: "terminal", heights: {}, previous: null });
  });

  specimen.it("restore hands out its own copy of the default", () => {
    const first = restore(null);
    specimen.expect(first !== DEFAULT && first.tree !== DEFAULT.tree && first.heights !== DEFAULT.heights).toBe(true);
    first.heights.terminal = 300;
    first.tree.ratio = 0.8;
    specimen.expect([DEFAULT.heights, DEFAULT.tree.ratio]).toEqual([{}, 0.3]);
  });

  specimen.it("the bridge boots the default from a save made before the tree", () => {
    withSaved({ panes: { open: [true, false, true], fold: [false, true, false], weight: [2, 1, 1] }, view: { theme: "parchment" } }, () => {
      const bridge = new Bridge();
      specimen.expect([leaves(bridge.panes.tree), bridge.panes.fold, bridge.panes.expanded, bridge.panes.heights, bridge.panes.previous]).toEqual([["terminal", "navigation"], "page", "terminal", {}, null]);
      specimen.expect(bridge.view.theme).toBe("parchment");
    });
  });

  specimen.it("the bridge saves tree · fold · expanded · heights, and never the tree a solo left", () => {
    withSaved(null, () => {
      const bridge = new Bridge();
      const alone = solo(three, "thread", null);
      bridge.panes.tree = alone.tree;
      bridge.panes.previous = alone.previous;
      bridge.panes.fold = "free";
      bridge.panes.expanded = "thread";
      bridge.panes.heights = { thread: 240 };
      bridge.save();
      specimen.expect(stored().panes).toEqual({ tree: leaf("thread"), fold: "free", expanded: "thread", heights: { thread: 240 } });
      const reloaded = new Bridge();
      specimen.expect([reloaded.panes.tree, reloaded.panes.fold, reloaded.panes.expanded, reloaded.panes.heights, reloaded.panes.previous]).toEqual([leaf("thread"), "free", "thread", { thread: 240 }, null]);
    });
  });
});

specimen.describe("panes — every op returns a new tree", () => {
  specimen.it("the source is not mutated", () => {
    const heights = { buffer: 240 };
    remove(three, "thread");
    open(three, "mode");
    swap(three, "terminal", "buffer");
    insert(three, "thread", "mode", "right");
    move(three, "buffer", "terminal", "left");
    move(three, "buffer", "terminal", "center");
    setRatio(three, "a", 0.2);
    setRatio(three, "", 0.99);
    solo(three, "thread", null);
    layout(three);
    arrange(three, "stack", "thread", heights);
    arrange(three, "accordion", "thread", heights);
    prune(three, available({}));
    restore({ tree: three, fold: "free", heights });
    tap({ tree: three, fold: "free" }, "thread");
    tap({ tree: three, fold: "page" }, "mode");
    latched({ tree: three, fold: "stack", expanded: "thread" }, "thread");
    under(layout(three).leaves, 10, 10);
    landing(layout(three).leaves[0], "center");
    specimen.expect(JSON.stringify(three)).toBe(frozen);
    specimen.expect(heights).toEqual({ buffer: 240 });
    specimen.expect(three.a.ratio).toBe(0.5);
    specimen.expect(leaves(three)).toEqual(["terminal", "thread", "buffer"]);
  });
});
