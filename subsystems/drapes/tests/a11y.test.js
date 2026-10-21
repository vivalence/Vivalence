import { specimen } from "@vivalence/typology";
import { tokens } from "@vivalence/dapper";
import { contrast } from "@vivalence/dapper/contrast";
import { document, parts, screen, THEMES, ZONES } from "./scenarios/index.js";
import { WORLDS } from "../design/worlds.js";
import { SPECIMENS } from "../design/specimens.js";

const TEXT = 4.5;
const MUTED = 3;
const GRAPHIC = 3;

const PAIRS = {
  Bar: [["text-ink", "surface", TEXT], ["text-strong", "surface", TEXT], ["text-light", "surface", TEXT], ["text-muted", "surface", MUTED]],
  Segment: [
    ["text-strong", "surface", TEXT],
    ["text-strong", "control-selected", TEXT],
    ["signal-primary-ink", "surface", TEXT],
    ["signal-caution-ink", "signal-caution-tint", TEXT],
    ["signal-negative-ink", "signal-negative-tint", TEXT],
    ["text-muted", "surface", MUTED],
  ],
  Dot: [["signal-positive", "surface", GRAPHIC], ["signal-primary", "surface", GRAPHIC], ["signal-caution", "surface", GRAPHIC], ["signal-negative", "surface", GRAPHIC], ["text-muted", "surface", GRAPHIC]],
  Meter: [["text-ink", "surface", GRAPHIC], ["signal-caution", "surface", GRAPHIC]],
  Tab: [["text-strong", "surface", TEXT], ["text-muted", "surface-sunk", MUTED], ["text-strong", "control-selected", TEXT], ["signal-primary", "surface-sunk", GRAPHIC]],
  Mark: [["text-strong", "surface", TEXT], ["signal-negative", "surface", GRAPHIC]],
  Panel: [["text-strong", "surface-lift", TEXT], ["signal-primary-ink", "surface-lift", TEXT], ["text-muted", "surface-lift", MUTED]],
  Row: [["signal-primary-ink", "surface-lift", TEXT], ["text-strong", "surface-lift", TEXT], ["text-light", "surface-lift", TEXT], ["text-muted", "surface-lift", MUTED], ["text-strong", "control-selected", TEXT]],
  Choice: [["text-muted", "surface-lift", MUTED], ["inverse-on", "inverse", TEXT]],
  Field: [["text-strong", "control-field", TEXT], ["text-muted", "control-field", MUTED], ["signal-primary-ink", "control-field", TEXT], ["signal-negative", "control-field", GRAPHIC]],
  Turn: [
    ["text-ink", "surface", TEXT],
    ["text-strong", "surface", TEXT],
    ["text-muted", "surface", MUTED],
    ["signal-primary-ink", "surface", TEXT],
    ["signal-negative-ink", "surface", TEXT],
    ["text-ink", "surface-sunk", TEXT],
    ["text-strong", "surface-sunk", TEXT],
    ["text-muted", "surface-sunk", MUTED],
    ["signal-positive-ink", "surface-sunk", TEXT],
    ["signal-caution-ink", "surface-sunk", TEXT],
    ["text-ink", "control-selected", TEXT],
  ],
  Consent: [["signal-caution-ink", "signal-caution-tint", TEXT], ["text-strong", "signal-caution-tint", TEXT], ["signal-caution", "surface", GRAPHIC]],
  Split: [["boundary-strong", "surface", 1.5]],
  Markdown: [["text-ink", "surface", TEXT], ["text-strong", "surface", TEXT], ["text-link", "surface", TEXT], ["text-light", "surface", TEXT]],
  JsonTree: [["text-ink", "surface", TEXT], ["text-strong", "surface", TEXT], ["signal-positive-ink", "surface", TEXT], ["signal-primary-ink", "surface", TEXT], ["signal-caution-ink", "surface", TEXT], ["text-muted", "surface", MUTED]],
  Image: [],
  Html: [],
};

const BELOW = [
  ["porcelain", "0", "Dot signal-primary/surface 2.3 < 3"],
  ["porcelain", "0", "Dot signal-negative/surface 2.8 < 3"],
  ["porcelain", "0", "Tab signal-primary/surface-sunk 2.6 < 3"],
  ["porcelain", "0", "Mark signal-negative/surface 2.8 < 3"],
];

const cell = (theme, zone) => {
  document.documentElement.setAttribute("data-theme", theme);
  const held = document.createElement("div");
  held.setAttribute("data-zone", zone);
  document.body.append(held);
  return held;
};

specimen.describe("a11y — every part mounts in every theme × zone; the pairs it reads are measured", () => {
  for (const theme of THEMES) {
    for (const zone of ZONES) {
      specimen.it(`${theme} · zone ${zone}: seventeen specimens over five worlds mount and unmount clean`, () => {
        const held = cell(theme, zone);
        for (const [name, build] of SPECIMENS) {
          for (const world of Object.values(WORLDS)) {
            const rig = screen(() => build(parts, world), { document: held.ownerDocument });
            if (rig.target.childNodes.length === 0) throw new Error(`${name} over ${world.name} rendered nothing`);
            rig.close();
            if (rig.target.childNodes.length !== 0) throw new Error(`${name} over ${world.name} left ${rig.target.childNodes.length} nodes`);
          }
        }
        held.remove();
      });

      specimen.it(`${theme} · zone ${zone}: the pairs each part reads meet their minimum`, () => {
        const palette = tokens.kebab(theme, zone);
        const short = [];
        for (const [name, pairs] of Object.entries(PAIRS)) {
          for (const [ink, ground, minimum] of pairs) {
            const measured = contrast(palette[ink], palette[ground]);
            if (measured < minimum) short.push(`${name} ${ink}/${ground} ${measured.toFixed(1)} < ${minimum}`);
          }
        }
        const known = BELOW.filter(([held, index]) => held === theme && index === zone).map(([, , entry]) => entry);
        specimen.expect(short).toEqual(known);
      });
    }
  }

  specimen.it("every specimen has a pairs row and every pair names a token", () => {
    const palette = tokens.kebab("northsea", "1");
    for (const [name] of SPECIMENS) specimen.expect(Object.hasOwn(PAIRS, name)).toBe(true);
    for (const pairs of Object.values(PAIRS)) for (const [ink, ground] of pairs) specimen.expect([ink, ground].every((token) => token in palette)).toBe(true);
  });
});
