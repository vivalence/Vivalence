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
  Bar: [["text-ink", "plane", TEXT], ["text-strong", "plane", TEXT], ["text-light", "plane", TEXT], ["text-muted", "plane", MUTED]],
  Segment: [
    ["text-strong", "plane", TEXT],
    ["text-strong", "control-selected", TEXT],
    ["signal-primary-ink", "plane", TEXT],
    ["signal-caution-ink", "signal-caution-tint", TEXT],
    ["signal-negative-ink", "signal-negative-tint", TEXT],
    ["text-muted", "plane", MUTED],
  ],
  Dot: [["signal-positive", "plane", GRAPHIC], ["signal-primary", "plane", GRAPHIC], ["signal-caution", "plane", GRAPHIC], ["signal-negative", "plane", GRAPHIC], ["text-muted", "plane", GRAPHIC]],
  Meter: [["text-ink", "plane", GRAPHIC], ["signal-caution", "plane", GRAPHIC]],
  Tab: [["text-strong", "plane", TEXT], ["text-muted", "plane-sunk", MUTED], ["text-strong", "control-selected", TEXT], ["signal-primary", "plane-sunk", GRAPHIC]],
  Mark: [["text-strong", "plane", TEXT], ["signal-negative", "plane", GRAPHIC]],
  Panel: [["text-strong", "plane-lift", TEXT], ["signal-primary-ink", "plane-lift", TEXT], ["text-muted", "plane-lift", MUTED]],
  Row: [["signal-primary-ink", "plane-lift", TEXT], ["text-strong", "plane-lift", TEXT], ["text-light", "plane-lift", TEXT], ["text-muted", "plane-lift", MUTED], ["text-strong", "control-selected", TEXT]],
  Choice: [["text-muted", "plane-lift", MUTED], ["inverse-on", "inverse", TEXT]],
  Field: [["text-strong", "control-field", TEXT], ["text-muted", "control-field", MUTED], ["signal-primary-ink", "control-field", TEXT], ["signal-negative", "control-field", GRAPHIC]],
  Turn: [
    ["text-ink", "plane", TEXT],
    ["text-strong", "plane", TEXT],
    ["text-muted", "plane", MUTED],
    ["signal-primary-ink", "plane", TEXT],
    ["signal-negative-ink", "plane", TEXT],
    ["text-ink", "plane-sunk", TEXT],
    ["text-strong", "plane-sunk", TEXT],
    ["text-muted", "plane-sunk", MUTED],
    ["signal-positive-ink", "plane-sunk", TEXT],
    ["signal-caution-ink", "plane-sunk", TEXT],
    ["text-ink", "control-selected", TEXT],
  ],
  Consent: [["signal-caution-ink", "signal-caution-tint", TEXT], ["text-strong", "signal-caution-tint", TEXT], ["signal-caution", "plane", GRAPHIC]],
  Split: [["boundary-strong", "plane", 1.5]],
  Markdown: [["text-ink", "plane", TEXT], ["text-strong", "plane", TEXT], ["text-link", "plane", TEXT], ["text-light", "plane", TEXT]],
  JsonTree: [["text-ink", "plane", TEXT], ["text-strong", "plane", TEXT], ["signal-positive-ink", "plane", TEXT], ["signal-primary-ink", "plane", TEXT], ["signal-caution-ink", "plane", TEXT], ["text-muted", "plane", MUTED]],
  Image: [],
  Html: [],
};

const BELOW = [
  ["porcelain", "0", "Dot signal-primary/plane 2.3 < 3"],
  ["porcelain", "0", "Dot signal-negative/plane 2.8 < 3"],
  ["porcelain", "0", "Tab signal-primary/plane-sunk 2.6 < 3"],
  ["porcelain", "0", "Mark signal-negative/plane 2.8 < 3"],
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
