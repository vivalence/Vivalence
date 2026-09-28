import { specimen, v } from "@vivalence/typology";

const theme = v.primitives.theme;

const NORTHSEA = {
  shape: { relief: "lift", radius: { key: "2xs", field: "2xs", card: "xs", pill: "2xs", disc: "2xs" } },
  text: { header: "#F4F6F9", strong: "#E6EAEF", ink: "#B4BFCB", light: "#8FA0B1", muted: "#6B7E91", link: "#51D8D0", code: "#E7C271" },
  control: {
    contrast: "#384A5E", contrastHover: "#4F6175", contrastPressed: "#243544",
    on: "#E6EAEF", onMuted: "#8FA0B1", onPressed: "#51D8D0", field: "#060D14", fieldPlaceholder: "#6B7E91",
    fieldCaret: "#1EBCB5", focus: "#51D8D0", scrollbar: "#384A5E", divider: "#243544",
  },
  signal: {
    primary: { fill: "#1EBCB5", ink: "#51D8D0", on: "#060D14" },
    positive: { fill: "#87B56A", ink: "#B0D19A", on: "#060D14" },
    caution: { fill: "#D4A054", ink: "#E7C271", on: "#060D14" },
    negative: { fill: "#BE7055", ink: "#D9A18D", on: "#060D14" },
  },
  zones: {
    0: { surface: "#0E1A25", surfaceSunk: "#060D14", surfaceLift: "#1A2A38", boundary: "#243544", boundaryStrong: "#4F6175", divider: "#1A2A38" },
    1: { surface: "#06101D", surfaceSunk: "#030812", surfaceLift: "#0A1628", boundary: "#243544", boundaryStrong: "#4F6175", divider: "#1A2A38" },
    2: { surface: "#060D14", surfaceSunk: "#030812", surfaceLift: "#0E1A25", boundary: "#1A2A38", boundaryStrong: "#384A5E", divider: "#0E1A25", inverse: "#CFD6DE", dim: 0.5 },
    3: { surface: "#1A2A38", surfaceSunk: "#0E1A25", surfaceLift: "#243544", boundary: "#384A5E", boundaryStrong: "#6B7E91", divider: "#243544", signal: { negative: { ink: "#EBCDC0" } } },
  },
};

const SPARSE = {
  shape: { relief: "sunk", radius: "3px" },
  size: { unit: ".3rem", type: { md: "1.0625rem" } },
  text: { strong: "#0B0F2D", ink: "#3D372A", muted: "#5A5240" },
  control: { contrast: "#DAD4C0", field: "#FBFAF2" },
  signal: { primary: "#045554", positive: "#41732A", caution: "#AC575C", negative: { fill: "#C74E31", ink: "#A23920" } },
  zones: { 0: { surface: "#F5F3E8", size: { unit: ".2rem" } }, 1: { surface: "#F0EDDE", boundary: "#A0967C" }, 3: "#FBFAF2" },
};

const ZONE = {
  surface: "#1A2A38", surfaceSunk: "#0E1A25", surfaceLift: "#243544",
  boundary: "#384A5E", boundaryStrong: "#6B7E91", boundarySoft: "rgba(56, 74, 94, 0.5)",
  divider: "#243544", inverse: "#E6EAEF", inverseOn: "#1A2A38",
  shadow: "rgba(0, 0, 0, 0.45)", scrim: "rgba(14, 26, 37, 0.6)", dim: 0.55,
  shape: {
    relief: "lift",
    radius: {
      "2xs": "1px", xs: "2px", sm: "3px", md: "4px", lg: "6px", xl: "8px", "2xl": "12px", "3xl": "16px", full: "999px",
      key: "2xs", field: "2xs", card: "xs", pill: "2xs", disc: "2xs",
    },
    label: { case: "uppercase", track: ".14em" },
    lift: "0 12px 30px", sunk: "inset 0 2px 3px",
  },
  size: {
    unit: ".25rem",
    space: { "2xs": 1, xs: 2, sm: 3, md: 4, lg: 6, xl: 8, "2xl": 12, "3xl": 16 },
    type: { "2xs": ".6875rem", xs: ".75rem", sm: ".875rem", md: "1rem", lg: "1.125rem", xl: "1.25rem", "2xl": "1.5rem", "3xl": "1.75rem" },
    gap: "xs", pad: { box: "sm", x: "sm", y: "2xs" }, icon: "md", field: "xl", row: 6.5, key: 7,
    leading: { tight: 1.1, loose: 1.45 }, ring: "1px", depth: "2px",
  },
  text: { header: "#F4F6F9", strong: "#E6EAEF", ink: "#B4BFCB", light: "#8FA0B1", muted: "#6B7E91", link: "#51D8D0", code: "#E7C271", disabled: 0.45 },
  control: {
    contrast: "#384A5E", contrastHover: "#4F6175", contrastPressed: "#243544",
    on: "#E6EAEF", onMuted: "#8FA0B1", onPressed: "#51D8D0", field: "#060D14", fieldPlaceholder: "#6B7E91",
    fieldCaret: "#1EBCB5", selected: "rgba(30, 188, 181, 0.18)", focus: "#51D8D0", scrollbar: "#384A5E", divider: "#243544",
  },
  signal: {
    primary: { fill: "#1EBCB5", ink: "#51D8D0", tint: "rgba(30, 188, 181, 0.18)", on: "#060D14" },
    positive: { fill: "#87B56A", ink: "#B0D19A", tint: "rgba(135, 181, 106, 0.18)", on: "#060D14" },
    caution: { fill: "#D4A054", ink: "#E7C271", tint: "rgba(212, 160, 84, 0.18)", on: "#060D14" },
    negative: { fill: "#BE7055", ink: "#EBCDC0", tint: "rgba(190, 112, 85, 0.18)", on: "#060D14" },
  },
  brand: { outline: "#1EBCB5", glow: "inset 0 0 12px rgba(30, 188, 181, 0.2)", filter: "drop-shadow(0 0 4px #1EBCB5)" },
  font: { family: { sansHeading: "Poppins, sans-serif", sansText: "Inter, sans-serif", serifHeading: "Poppins, serif", serifText: "Inter, Sabon, serif", brand: "K2D, sans-serif", code: "Victor Mono, monospace" } },
};

const GROUPS = ["shape", "size", "text", "control", "signal", "brand", "font"];
const WHOLE = { ...Object.fromEntries(GROUPS.map((group) => [group, ZONE[group]])), zones: [ZONE, ZONE, ZONE, ZONE] };

const plain = (held) => held !== null && typeof held === "object" && !Array.isArray(held);
const paths = (held, at = []) =>
  Object.entries(held).flatMap(([key, value]) => (plain(value) || Array.isArray(value) ? paths(value, [...at, key]) : [[...at, key]]));
const pointer = (path) => (path.length ? `/${path.join("/")}` : "/");
const without = (held, path) => {
  const copy = structuredClone(held);
  const parent = path.slice(0, -1).reduce((carried, key) => carried[key], copy);
  delete parent[path.at(-1)];
  return copy;
};
const swapped = (held, path, value) => {
  const copy = structuredClone(held);
  path.slice(0, -1).reduce((carried, key) => carried[key], copy)[path.at(-1)] = value;
  return copy;
};
const count = (shape) => Object.values(shape).reduce((sum, held) => sum + (theme.leaf(held) ? 1 : count(held)), 0);

const SCALARS = [
  ["Hex", ["#1A2A38", "#ffffff", "#0B0f2D"], ["#FFF", "1A2A38", "#1A2A3", "#1A2A388", "#GGGGGG", "rgb(0,0,0)", "red", "", 0, null]],
  ["Alpha", ["rgba(30, 188, 181, 0.18)", "rgba(0,0,0,.4)", "rgba(0, 0, 0, 1)", "rgba(255, 255, 255, 0)"], ["rgba(0, 0, 0)", "rgba(0, 0, 0, 1.5)", "rgb(0, 0, 0, .5)", "rgba(0 0 0 / .5)", "#000000", ""]],
  ["Color", ["#1A2A38", "rgba(30, 188, 181, 0.18)"], ["oklch(0.5 0.1 200)", "transparent", "var(--surface)", 1]],
  ["Px", ["1px", "0px", "1.5px", "999px"], [1, "1", "1rem", "-1px", "px", "1 px", "1PX"]],
  ["Percent", ["50%", "0%", "12.5%"], ["50", 50, "50px", "%"]],
  ["Rem", [".25rem", "1rem", "1.0625rem", "0.2rem"], ["1px", 1, "rem", "1 rem", "-1rem", "1em"]],
  ["Em", [".14em", "0em", "1em"], [".14rem", 0.14, "em"]],
  ["Factor", [0, 1, 6.5, 16], [-1, "1", null]],
  ["Ratio", [0, 0.45, 1], [-0.1, 1.01, ".45", null]],
  ["Leading", [0.8, 1.1, 1.45, 2], [0.79, 2.01, "1.1"]],
  ["Shadow", ["0 12px 30px", "inset 0 2px 3px"], ["", 0, null]],
  ["Family", ["Inter, sans-serif", "VT323, Space Mono, monospace"], ["", 0, null]],
  ["Glow", ["inset 0 0 12px rgba(30, 188, 181, 0.2)", "0 0 0 transparent"], ["", 0, null]],
  ["Filter", ["drop-shadow(0 0 4px #1EBCB5)", "none"], ["", 0, null]],
  ["Step", ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"], ["full", "base", "4xl", "", "SM", 1]],
  ["Round", ["2xs", "3xl", "full"], ["round", "none", "4xl"]],
  ["Relief", ["sunk", "lift"], ["inset", "raised", "flat", ""]],
  ["Case", ["uppercase", "lowercase", "capitalize", "none"], ["upper", "title", ""]],
  ["SignalName", ["primary", "positive", "caution", "negative"], ["danger", "warning", "success", "error", "info", "secondary"]],
  ["ZoneIndex", ["0", "1", "2", "3"], ["4", "-1", "", "chrome"]],
];

specimen.describe("theme primitive — the scalars", () => {
  for (const [name, passing, failing] of SCALARS) {
    specimen.it(`${name} takes its own values and refuses the rest`, () => {
      for (const value of passing) specimen.expect([name, value, theme[name].check(value)]).toEqual([name, value, true]);
      for (const value of failing) specimen.expect([name, value, theme[name].check(value)]).toEqual([name, value, false]);
    });
  }
});

specimen.describe("theme primitive — the token space, counted", () => {
  specimen.it("seven groups hold 94 keys: shape 19 · size 29 · text 8 · control 13 · signal 16 · brand 3 · font 6", () => {
    specimen.expect(Object.fromEntries(GROUPS.map((group) => [group, count(theme.groups[group])]))).toEqual({
      shape: 19, size: 29, text: 8, control: 13, signal: 16, brand: 3, font: 6,
    });
  });

  specimen.it("a zone owns 12 ground keys and emits 106", () => {
    specimen.expect(count(theme.ground)).toBe(12);
    specimen.expect(paths(ZONE)).toHaveLength(106);
  });

  specimen.it("a whole theme holds 94 + 4 × 106 values", () => {
    specimen.expect(paths(WHOLE)).toHaveLength(94 + 4 * 106);
  });

  specimen.it("space, type and radius share the eight step names; radius adds full", () => {
    specimen.expect(Object.keys(theme.size.space)).toEqual(theme.STEPS);
    specimen.expect(Object.keys(theme.size.type)).toEqual(theme.STEPS);
    specimen.expect(Object.keys(theme.shape.radius).slice(0, 9)).toEqual([...theme.STEPS, "full"]);
  });

  specimen.it("four zones, each a named territory", () => {
    specimen.expect(theme.ZONES).toEqual(["0", "1", "2", "3"]);
    specimen.expect(theme.TERRITORIES).toEqual({ 0: "chrome", 1: "body", 2: "island", 3: "bench" });
  });

  specimen.it("leaf tells a schematic from a plain tree, a tree holding a key named type included", () => {
    specimen.expect(theme.leaf(theme.Px)).toBe(true);
    specimen.expect(theme.leaf(theme.Color)).toBe(true);
    specimen.expect(theme.leaf(theme.size.type)).toBe(false);
    specimen.expect(theme.leaf(theme.shape.radius)).toBe(false);
    specimen.expect(theme.leaf(theme.signal.primary)).toBe(false);
  });

  specimen.it("every size and shape key carries a default; of the colours only shadow does", () => {
    const bare = (shape, at = []) =>
      Object.entries(shape).flatMap(([key, held]) =>
        theme.leaf(held) ? (typeof held.default === "function" ? [[...at, key].join(".")] : []) : bare(held, [...at, key]));
    specimen.expect(bare(theme.shape)).toEqual([]);
    specimen.expect(bare(theme.size)).toEqual([]);
    specimen.expect(bare(theme.text)).toEqual(["header", "strong", "ink", "light", "muted", "link", "code"]);
    specimen.expect(bare(theme.ground)).toEqual([
      "surface", "surfaceSunk", "surfaceLift", "boundary", "boundaryStrong", "boundarySoft", "divider", "inverse", "inverseOn", "scrim",
    ]);
    specimen.expect(bare(theme.control)).toHaveLength(13);
    specimen.expect(bare(theme.signal)).toHaveLength(16);
  });

  specimen.it("every default passes its own schematic", () => {
    const walk = (shape, at = []) =>
      Object.entries(shape).flatMap(([key, held]) =>
        theme.leaf(held) ? (typeof held.default === "function" ? [] : [[[...at, key].join("."), held.check(held.default)]]) : walk(held, [...at, key]));
    for (const [path, passes] of [...walk(theme.shape), ...walk(theme.size), ...walk(theme.text), ...walk(theme.ground)]) {
      specimen.expect([path, passes]).toEqual([path, true]);
    }
  });
});

specimen.describe("theme primitive — Definition, any subset in any form", () => {
  specimen.it("northsea's definition passes", () => {
    specimen.expect(theme.Definition.faults(NORTHSEA)).toEqual([]);
  });

  specimen.it("the sparse definition passes: three shorthands, no zone 2", () => {
    specimen.expect(theme.Definition.faults(SPARSE)).toEqual([]);
  });

  specimen.it("an empty definition passes the schematic", () => {
    specimen.expect(theme.Definition.check({})).toBe(true);
  });

  specimen.it("every single stated key of northsea passes alone", () => {
    for (const path of paths(NORTHSEA)) {
      const alone = path.reduceRight((held, key) => ({ [key]: held }), path.reduce((carried, key) => carried[key], NORTHSEA));
      specimen.expect([pointer(path), theme.Definition.faults(alone)]).toEqual([pointer(path), []]);
    }
  });

  specimen.it("a key outside the token space faults where it sits", () => {
    const cases = [
      [{ text: { inc: "#000000" } }, "/text"],
      [{ colour: {} }, "/"],
      [{ control: { highlight: "#000000" } }, "/control"],
      [{ shape: { veil: "rgba(0, 0, 0, 0.4)" } }, "/shape"],
      [{ size: { track: ".14em" } }, "/size"],
      [{ zones: { 4: "#FBFAF2" } }, "/zones"],
      [{ signal: { danger: "#C74E31" } }, "/signal"],
      [{ scheme: "dark" }, "/"],
    ];
    for (const [definition, at] of cases) {
      specimen.expect([at, theme.Definition.faults(definition).map((fault) => fault.at).includes(at)]).toEqual([at, true]);
    }
  });

  specimen.it("retired words fault inside a zone as well", () => {
    for (const key of ["surfaceRaised", "onInverse", "icon", "iconStrong", "scheme"]) {
      specimen.expect([key, theme.Definition.check({ zones: { 1: { surface: "#F0EDDE", [key]: "#000000" } } })]).toEqual([key, false]);
    }
  });

  specimen.it("a wrong scalar faults at its key", () => {
    const cases = [
      [["text", "ink"], "ink"],
      [["text", "disabled"], 2],
      [["shape", "relief"], "inset"],
      [["shape", "radius", "card"], "2px"],
      [["control", "contrast"], "var(--surface)"],
      [["zones", "2", "dim"], ".5"],
      [["zones", "0", "surface"], "#0E1A2"],
    ];
    for (const [path, value] of cases) {
      const faults = theme.Definition.faults(swapped(NORTHSEA, path, value));
      specimen.expect([pointer(path), faults.some((fault) => fault.at.startsWith(pointer(path.slice(0, 2))))]).toEqual([pointer(path), true]);
    }
  });

  specimen.it("the shorthands: a px for radius, a colour for a signal, a colour for a zone", () => {
    specimen.expect(theme.Definition.check({ shape: { radius: "3px" } })).toBe(true);
    specimen.expect(theme.Definition.check({ shape: { radius: 3 } })).toBe(false);
    specimen.expect(theme.Definition.check({ shape: { radius: "sm" } })).toBe(false);
    specimen.expect(theme.Definition.check({ signal: { primary: "#045554" } })).toBe(true);
    specimen.expect(theme.Definition.check({ signal: { primary: "aqua" } })).toBe(false);
    specimen.expect(theme.Definition.check({ zones: { 3: "#FBFAF2" } })).toBe(true);
    specimen.expect(theme.Definition.check({ zones: { 3: "paper" } })).toBe(false);
  });

  specimen.it("a zone may restate any group, per key, shorthands included", () => {
    specimen.expect(theme.Definition.faults({
      zones: {
        0: { surface: "#F5F3E8", size: { unit: ".2rem" }, shape: { radius: "0px" }, signal: { negative: "#A23920" }, text: { muted: "#5A5240" }, control: { focus: "#045554" } },
      },
    })).toEqual([]);
  });

  specimen.it("a zone never nests a zone", () => {
    specimen.expect(theme.Definition.check({ zones: { 0: { surface: "#F5F3E8", zones: { 1: "#F0EDDE" } } } })).toBe(false);
  });
});

specimen.describe("theme primitive — Zone and Theme, always all of it", () => {
  specimen.it("zone 3 of northsea passes Zone", () => {
    specimen.expect(theme.Zone.faults(ZONE)).toEqual([]);
  });

  specimen.it("a whole theme passes Theme", () => {
    specimen.expect(theme.Theme.faults(WHOLE)).toEqual([]);
  });

  specimen.it("a zone short of any one of its 106 keys faults at that key's parent", () => {
    for (const path of paths(ZONE)) {
      const faults = theme.Zone.faults(without(ZONE, path));
      specimen.expect([pointer(path), faults.map((fault) => fault.at)]).toEqual([pointer(path), [pointer(path.slice(0, -1))]]);
    }
  });

  specimen.it("a theme short of any one of its 518 values faults at that value's parent", () => {
    for (const path of paths(WHOLE)) {
      const faults = theme.Theme.faults(without(WHOLE, path));
      specimen.expect([pointer(path), faults.map((fault) => fault.at).includes(pointer(path.slice(0, -1)))]).toEqual([pointer(path), true]);
    }
  });

  specimen.it("every one of a zone's 106 values refuses a value of the wrong kind", () => {
    for (const path of paths(ZONE)) {
      const held = path.reduce((carried, key) => carried[key], ZONE);
      const wrong = typeof held === "number" ? "wrong" : 7;
      specimen.expect([pointer(path), theme.Zone.check(swapped(ZONE, path, wrong))]).toEqual([pointer(path), false]);
    }
  });

  specimen.it("a family is a list with a first choice: Font refuses an empty one, a Definition states one alone", () => {
    specimen.expect(theme.Font.check(ZONE.font)).toBe(true);
    specimen.expect(theme.Font.check({ family: { ...ZONE.font.family, code: "" } })).toBe(false);
    specimen.expect(theme.Definition.faults({ font: { family: { code: "IBM Plex Mono, monospace" } } })).toEqual([]);
    specimen.expect(theme.Definition.check({ font: { family: { mono: "IBM Plex Mono, monospace" } } })).toBe(false);
    specimen.expect(theme.Definition.check({ font: { size: { md: "1rem" } } })).toBe(false);
    specimen.expect(theme.Definition.faults({ zones: { 2: { surface: "#FFFFFF", font: { family: { sansText: "IBM Plex Sans, sans-serif" } } } } })).toEqual([]);
  });

  specimen.it("a theme holds four zones, never three, never five", () => {
    specimen.expect(theme.Theme.check({ ...WHOLE, zones: [ZONE, ZONE, ZONE] })).toBe(false);
    specimen.expect(theme.Theme.check({ ...WHOLE, zones: [ZONE, ZONE, ZONE, ZONE, ZONE] })).toBe(false);
  });

  specimen.it("a key outside the token space faults in a zone and in a theme", () => {
    specimen.expect(theme.Zone.check({ ...ZONE, surfaceRaised: "#243544" })).toBe(false);
    specimen.expect(theme.Theme.check({ ...WHOLE, scheme: "dark" })).toBe(false);
    specimen.expect(theme.Zone.check({ ...ZONE, text: { ...ZONE.text, body: "#B4BFCB" } })).toBe(false);
  });

  specimen.it("a definition's shorthand is refused by a whole zone", () => {
    specimen.expect(theme.Zone.check(swapped(ZONE, ["signal", "primary"], "#1EBCB5"))).toBe(false);
    specimen.expect(theme.Zone.check(swapped(ZONE, ["shape", "radius"], "3px"))).toBe(false);
  });

  specimen.it("the primitive is reached through v", () => {
    specimen.expect(v.primitives.theme.Theme.check(WHOLE)).toBe(true);
  });
});
