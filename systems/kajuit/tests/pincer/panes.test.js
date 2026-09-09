import { specimen } from "@vivalence/typology";
import {
  PANE_BAR,
  PANE_MIN,
  fitPaneRun,
  layoutPanes,
  normalisePanes,
  openPanes,
  pushPanes,
  settlePanes,
} from "../../src/typology/stores/bridge/panes.js";

const BOOLS = [
  [false, false, false],
  [true, false, false],
  [false, true, false],
  [false, false, true],
  [true, true, false],
  [true, false, true],
  [false, true, true],
  [true, true, true],
];
const OPENS = BOOLS.filter((open) => open.some(Boolean));
const WEIGHTS = [
  [1, 1, 1],
  [3, 1, 1],
  [1, 3, 1],
  [1, 1, 3],
  [200, 400, 90],
];
const AREAS = [0, 44, 132, 300, 640, 900, 1600];

const total = (sizes, open) => openPanes(open).reduce((carry, i) => carry + sizes[i], 0);
const near = (a, b) => Math.abs(a - b) < 0.01;

specimen.describe("panes — sizing invariants swept over the whole state space", () => {
  specimen.it("normalisePanes always fills the run, folded panes included", () => {
    let cases = 0;
    for (const open of OPENS) {
      for (const fold of BOOLS) {
        for (const weight of WEIGHTS) {
          for (const area of AREAS) {
            const sizes = normalisePanes(open, fold, weight, area);
            const floor = openPanes(open).length * PANE_BAR;
            const expected = Math.max(floor, area);
            specimen
              .expect(`${open}/${fold}/${area} ${near(total(sizes, open), expected)}`)
              .toBe(`${open}/${fold}/${area} true`);
            cases++;
          }
        }
      }
    }
    specimen.expect(cases).toBe(OPENS.length * BOOLS.length * WEIGHTS.length * AREAS.length);
  });

  specimen.it("a docked pane measures zero and never takes space", () => {
    for (const open of OPENS) {
      const sizes = normalisePanes(open, [false, false, false], [1, 1, 1], 600);
      for (let i = 0; i < 3; i++) if (!open[i]) specimen.expect(sizes[i]).toBe(0);
    }
  });

  specimen.it("no unfolded pane sits below its floor", () => {
    for (const open of OPENS) {
      for (const fold of BOOLS) {
        for (const area of AREAS) {
          const sizes = normalisePanes(open, fold, [1, 1, 1], area);
          const oi = openPanes(open);
          const run = oi.filter((i) => !fold[i]);
          if (!run.length) continue;
          const available = Math.max(
            run.length * PANE_BAR,
            area - (oi.length - run.length) * PANE_BAR,
          );
          const floor = Math.min(PANE_MIN, available / run.length);
          for (const i of run) {
            specimen.expect(`${open}/${area} ${sizes[i] >= floor - 0.01}`).toBe(`${open}/${area} true`);
          }
        }
      }
    }
  });

  specimen.it("the all-folded state still fills the run — the v3 dead-space defect", () => {
    for (const open of OPENS) {
      for (const area of AREAS) {
        const sizes = normalisePanes(open, [true, true, true], [1, 1, 1], area);
        const expected = Math.max(openPanes(open).length * PANE_BAR, area);
        specimen
          .expect(`all-folded ${open}/${area} ${near(total(sizes, open), expected)}`)
          .toBe(`all-folded ${open}/${area} true`);
      }
    }
  });

  specimen.it("one folded pane in a 100px C leaves no bare background", () => {
    const sizes = normalisePanes([true, false, false], [true, false, false], [1, 1, 1], 100);
    specimen.expect(sizes[0]).toBe(100);
  });

  specimen.it("pushPanes preserves the area and never drives a pane under the bar", () => {
    const deltas = [-900, -320, -120, -45, -8, 0, 8, 45, 120, 320, 900];
    for (const open of OPENS) {
      const oi = openPanes(open);
      if (oi.length < 2) continue;
      for (const area of [300, 640, 900, 1600]) {
        const start = normalisePanes(open, [false, false, false], [1, 1, 1], area);
        for (let boundary = 1; boundary < oi.length; boundary++) {
          for (const delta of deltas) {
            const sizes = pushPanes(start, oi, boundary, delta, area);
            specimen
              .expect(`${open}/${area}/${boundary}/${delta} ${near(total(sizes, open), area)}`)
              .toBe(`${open}/${area}/${boundary}/${delta} true`);
            for (const i of oi) {
              specimen
                .expect(`${open}/${delta} pane${i} ${sizes[i] >= PANE_BAR - 0.01}`)
                .toBe(`${open}/${delta} pane${i} true`);
            }
          }
        }
      }
    }
  });

  specimen.it("pushPanes is monotone in the drag delta", () => {
    const open = [true, true, true];
    const oi = openPanes(open);
    const area = 900;
    const start = normalisePanes(open, [false, false, false], [1, 1, 1], area);
    let previous = -Infinity;
    for (const delta of [-600, -300, -100, -20, 0, 20, 100, 300, 600]) {
      const sizes = pushPanes(start, oi, 1, delta, area);
      specimen.expect(sizes[oi[0]] >= previous - 0.01).toBe(true);
      previous = sizes[oi[0]];
    }
  });

  specimen.it("fitPaneRun on an empty run returns nothing instead of a junk key", () => {
    specimen.expect(Object.keys(fitPaneRun([], [100, 100, 100], 300)).length).toBe(0);
  });

  specimen.it("settlePanes bumps a squeezed pane to the minimum and conserves the total", () => {
    const open = [true, true, true];
    const before = [120, 600, 180];
    const after = settlePanes(before, open);
    specimen.expect(near(total(after, open), total(before, open))).toBe(true);
    specimen.expect(after[0]).toBe(PANE_MIN);
    specimen.expect(after[1] < before[1]).toBe(true);
  });

  specimen.it("settlePanes leaves a run with no donor untouched", () => {
    const open = [true, true, true];
    const before = [60, 60, 60];
    specimen.expect(settlePanes(before, open)).toEqual(before);
  });

  specimen.it("settlePanes never lifts a folded pane off the bar", () => {
    const open = [true, true, true];
    const after = settlePanes([PANE_BAR, 700, 100], open);
    specimen.expect(after[0]).toBe(PANE_BAR);
  });
});

specimen.describe("panes — layout places every pane inside C", () => {
  const RECTS = [
    { width: 320, height: 900 },
    { width: 900, height: 320 },
    { width: 600, height: 600 },
    { width: 120, height: 100 },
  ];

  specimen.it("open panes tile the run and docked panes tile the twig bar", () => {
    for (const rect of RECTS) {
      for (const open of OPENS) {
        for (const fold of BOOLS) {
          const l = layoutPanes(rect, { open, fold, weight: [1, 1, 1] });
          const run = l.oi.reduce((carry, i) => carry + l.size[i], 0);
          specimen
            .expect(`${rect.width}x${rect.height}/${open} ${near(run, Math.max(l.oi.length * PANE_BAR, l.area))}`)
            .toBe(`${rect.width}x${rect.height}/${open} true`);
          const tabs = l.docked.reduce((carry, i) => carry + l.places[i].width, 0);
          specimen
            .expect(`tabs ${open} ${near(tabs, l.docked.length ? rect.width : 0)}`)
            .toBe(`tabs ${open} true`);
        }
      }
    }
  });

  specimen.it("the twig bar sits on C's leading cross-axis edge in both layouts", () => {
    for (const rect of RECTS) {
      const l = layoutPanes(rect, { open: [true, false, true], fold: [false, false, false], weight: [1, 1, 1] });
      for (const i of l.docked) specimen.expect(l.places[i].top).toBe(0);
      for (const i of l.oi) specimen.expect(l.places[i].top >= l.twig - 0.01).toBe(true);
    }
  });

  specimen.it("every pane docked leaves an empty run, not a negative one", () => {
    const l = layoutPanes({ width: 400, height: 800 }, {
      open: [false, false, false],
      fold: [false, false, false],
      weight: [1, 1, 1],
    });
    specimen.expect(l.oi.length).toBe(0);
    specimen.expect(l.docked.length).toBe(3);
    specimen.expect(l.area >= 0).toBe(true);
  });
});
