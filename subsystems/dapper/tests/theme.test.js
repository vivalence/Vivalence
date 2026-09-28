import { specimen, v } from "@vivalence/typology";
import { theme } from "../lib/theme.js";
import { declarations } from "../lib/emit.js";
import { THEMES } from "../themes/index.js";

const { Theme, Zone, STEPS, SIGNALS } = v.primitives.theme;

const FLOOR = { text: { ink: "#3D372A" }, signal: { primary: "#045554" }, zones: { 1: "#F0EDDE" } };

const SPARSE = {
  shape: { relief: "sunk", radius: "3px" },
  size: { unit: ".3rem", type: { md: "1.0625rem" } },
  text: { strong: "#0B0F2D", ink: "#3D372A", muted: "#5A5240" },
  control: { contrast: "#DAD4C0", field: "#FBFAF2" },
  signal: { primary: "#045554", positive: "#41732A", caution: "#AC575C", negative: { fill: "#C74E31", ink: "#A23920" } },
  zones: { 0: { surface: "#F5F3E8", size: { unit: ".2rem" } }, 1: { surface: "#F0EDDE", boundary: "#A0967C" }, 3: "#FBFAF2" },
};

const plain = (held) => held !== null && typeof held === "object" && !Array.isArray(held);
const paths = (held, at = []) =>
  Object.entries(held).flatMap(([key, value]) => (plain(value) || Array.isArray(value) ? paths(value, [...at, key]) : [[...at, key].join(".")]));
const over = (...layers) => theme(FLOOR, ...layers);

specimen.describe("theme() — the floor", () => {
  specimen.it("three values complete to a whole theme", () => {
    const held = theme(FLOOR);
    specimen.expect(Theme.faults(held)).toEqual([]);
    specimen.expect(paths(held)).toHaveLength(94 + 4 * 106);
  });

  specimen.it("below the floor it throws, naming what is lacking", () => {
    const cases = [
      [{ signal: FLOOR.signal, zones: FLOOR.zones }, "text.ink"],
      [{ text: FLOOR.text, zones: FLOOR.zones }, "signal.primary fill"],
      [{ text: FLOOR.text, signal: FLOOR.signal }, "one zone surface"],
      [{ text: FLOOR.text, signal: FLOOR.signal, zones: { 1: { boundary: "#A0967C" } } }, "one zone surface"],
      [{ text: FLOOR.text, signal: { primary: { ink: "#045554" } }, zones: FLOOR.zones }, "signal.primary fill"],
      [{ text: { strong: "#0B0F2D" }, signal: FLOOR.signal, zones: FLOOR.zones }, "text.ink"],
    ];
    for (const [definition, lacking] of cases) {
      let message = "did not throw";
      try {
        theme(definition);
      } catch (error) {
        message = error.message;
      }
      specimen.expect([lacking, message.includes(lacking)]).toEqual([lacking, true]);
    }
  });

  specimen.it("an empty definition names all three", () => {
    specimen.expect(() => theme({})).toThrow("one zone surface · text.ink · signal.primary fill");
  });

  specimen.it("no definition at all throws the same way", () => {
    specimen.expect(() => theme()).toThrow("below the floor");
  });

  specimen.it("a definition that fails its schematic throws at the faulted key, before any completion", () => {
    specimen.expect(() => over({ text: { inc: "#000000" } })).toThrow("definition 1 /text");
    specimen.expect(() => over({ shape: { relief: "inset" } })).toThrow("definition 1 /shape/relief");
    specimen.expect(() => over({ zones: { 4: "#FBFAF2" } })).toThrow("definition 1 /zones");
    specimen.expect(() => theme({ ...FLOOR, scheme: "dark" })).toThrow("definition 0 /");
  });
});

specimen.describe("theme() — fill: size and shape take the schematic default", () => {
  const held = theme(FLOOR);

  specimen.it("size is the tree's", () => {
    specimen.expect(held.size).toEqual({
      unit: ".25rem",
      space: { "2xs": 1, xs: 2, sm: 3, md: 4, lg: 6, xl: 8, "2xl": 12, "3xl": 16 },
      type: { "2xs": ".6875rem", xs: ".75rem", sm: ".875rem", md: "1rem", lg: "1.125rem", xl: "1.25rem", "2xl": "1.5rem", "3xl": "1.75rem" },
      gap: "xs", pad: { box: "sm", x: "sm", y: "2xs" }, icon: "md", field: "xl", row: 6.5, key: 7,
      leading: { tight: 1.1, loose: 1.45 }, ring: "1px", depth: "2px",
    });
  });

  specimen.it("shape is the tree's", () => {
    specimen.expect(held.shape).toEqual({
      relief: "lift",
      radius: {
        "2xs": "1px", xs: "2px", sm: "3px", md: "4px", lg: "6px", xl: "8px", "2xl": "12px", "3xl": "16px", full: "999px",
        key: "2xs", field: "2xs", card: "xs", pill: "2xs", disc: "2xs",
      },
      label: { case: "uppercase", track: ".14em" },
      lift: "0 12px 30px", sunk: "inset 0 2px 3px",
    });
  });

  specimen.it("the three ratios and the shadow tone", () => {
    specimen.expect(held.text.disabled).toBe(0.45);
    specimen.expect(held.zones.map((zone) => [zone.dim, zone.shadow])).toEqual(Array(4).fill([0.55, "rgba(0, 0, 0, 0.45)"]));
  });

  specimen.it("a stated size key keeps every sibling at its default", () => {
    const stated = over({ size: { unit: ".3rem", type: { md: "1.0625rem" }, pad: { y: "xs" }, leading: { loose: 1.6 } } });
    specimen.expect(stated.size.unit).toBe(".3rem");
    specimen.expect(stated.size.type).toEqual({ ...held.size.type, md: "1.0625rem" });
    specimen.expect(stated.size.pad).toEqual({ box: "sm", x: "sm", y: "xs" });
    specimen.expect(stated.size.leading).toEqual({ tight: 1.1, loose: 1.6 });
    specimen.expect(stated.size.space).toEqual(held.size.space);
  });

  specimen.it("one px for radius sets every step, leaves full and the entities", () => {
    const stated = over({ shape: { radius: "3px" } });
    specimen.expect(STEPS.map((step) => stated.shape.radius[step])).toEqual(Array(8).fill("3px"));
    specimen.expect(stated.shape.radius.full).toBe("999px");
    specimen.expect(stated.shape.radius.card).toBe("xs");
  });

  specimen.it("a stated entity names its step, the scale untouched", () => {
    const stated = over({ shape: { radius: { pill: "full", md: "5px" } } });
    specimen.expect(stated.shape.radius.pill).toBe("full");
    specimen.expect(stated.shape.radius.md).toBe("5px");
    specimen.expect(stated.shape.radius.sm).toBe("3px");
  });
});

specimen.describe("theme() — derive: text", () => {
  const steps = (text) => {
    const held = over({ text }).text;
    return [held.header, held.strong, held.ink, held.light, held.muted];
  };
  const INK = FLOOR.text.ink;

  specimen.it("ink alone gives all five steps", () => {
    specimen.expect(steps({})).toEqual([INK, INK, INK, INK, INK]);
  });

  specimen.it("an omitted step takes the nearest stated one", () => {
    specimen.expect(steps({ header: "#000001" })).toEqual(["#000001", "#000001", INK, INK, INK]);
    specimen.expect(steps({ muted: "#000005" })).toEqual([INK, INK, INK, INK, "#000005"]);
    specimen.expect(steps({ strong: "#000002", muted: "#000005" })).toEqual(["#000002", "#000002", INK, INK, "#000005"]);
  });

  specimen.it("on a tie the stronger side wins", () => {
    specimen.expect(steps({ header: "#000001", muted: "#000005" })[1]).toBe("#000001");
    specimen.expect(steps({ header: "#000001", muted: "#000005" })[3]).toBe(INK);
    specimen.expect(over({ text: { strong: "#000002", light: "#000004" } }).text.ink).toBe(INK);
  });

  specimen.it("link and code take the primary and the caution ink", () => {
    const held = over({ signal: { primary: { ink: "#0000A1" }, caution: { fill: "#0000C0", ink: "#0000C1" } } });
    specimen.expect([held.text.link, held.text.code]).toEqual(["#0000A1", "#0000C1"]);
  });

  specimen.it("a stated link and code stand", () => {
    const held = over({ text: { link: "#111111", code: "#222222", disabled: 0.3 } });
    specimen.expect([held.text.link, held.text.code, held.text.disabled]).toEqual(["#111111", "#222222", 0.3]);
  });
});

specimen.describe("theme() — derive: signal", () => {
  specimen.it("a colour for a signal is its fill; ink is the fill, tint the fill at .18", () => {
    const { primary } = theme(FLOOR).signal;
    specimen.expect(primary.fill).toBe("#045554");
    specimen.expect(primary.ink).toBe("#045554");
    specimen.expect(primary.tint).toBe("rgba(4, 85, 84, 0.18)");
  });

  specimen.it("an omitted signal takes the primary fill", () => {
    const held = theme(FLOOR).signal;
    for (const name of SIGNALS) specimen.expect([name, held[name].fill]).toEqual([name, "#045554"]);
  });

  specimen.it("on is the text header or the bench surface, whichever reads better on the fill", () => {
    const dark = theme({ text: { ink: "#101010" }, signal: { primary: "#F0F0F0", negative: "#202020" }, zones: { 3: "#FAFAFA" } });
    specimen.expect(dark.signal.primary.on).toBe("#101010");
    specimen.expect(dark.signal.negative.on).toBe("#FAFAFA");
  });

  specimen.it("stated ink, tint and on stand", () => {
    const held = over({ signal: { caution: { fill: "#AC575C", ink: "#111111", tint: "rgba(1, 2, 3, 0.5)", on: "#222222" } } });
    specimen.expect(held.signal.caution).toEqual({ fill: "#AC575C", ink: "#111111", tint: "rgba(1, 2, 3, 0.5)", on: "#222222" });
  });

  specimen.it("four signals, four keys each, in every zone", () => {
    for (const zone of theme(FLOOR).zones) {
      specimen.expect(Object.keys(zone.signal)).toEqual(SIGNALS);
      for (const name of SIGNALS) specimen.expect(Object.keys(zone.signal[name])).toEqual(["fill", "ink", "tint", "on"]);
    }
  });
});

specimen.describe("theme() — derive: control", () => {
  specimen.it("hover, pressed and scrollbar take contrast; divider takes pressed", () => {
    const { control } = over({ control: { contrast: "#DAD4C0" } });
    specimen.expect([control.contrastHover, control.contrastPressed, control.scrollbar, control.divider]).toEqual(Array(4).fill("#DAD4C0"));
    specimen.expect(over({ control: { contrast: "#DAD4C0", contrastPressed: "#C1B9A0" } }).control.divider).toBe("#C1B9A0");
  });

  specimen.it("the three labels take text strong, text light and the primary ink", () => {
    const { control } = over({ text: { strong: "#000002", light: "#000004" }, signal: { primary: { ink: "#0000A1" } } });
    specimen.expect([control.on, control.onMuted, control.onPressed]).toEqual(["#000002", "#000004", "#0000A1"]);
  });

  specimen.it("placeholder, caret, focus and selected", () => {
    const { control } = over({ text: { muted: "#000005" }, signal: { primary: { ink: "#0000A1" } } });
    specimen.expect([control.fieldPlaceholder, control.fieldCaret, control.focus, control.selected])
      .toEqual(["#000005", "#045554", "#0000A1", "rgba(4, 85, 84, 0.18)"]);
  });

  specimen.it("an omitted contrast takes the zone's boundary, an omitted field its sunk step", () => {
    const held = over({ zones: { 1: { surface: "#F0EDDE", surfaceSunk: "#E9E5D3", boundary: "#A0967C" } } });
    specimen.expect([held.control.contrast, held.control.field]).toEqual(["#A0967C", "#E9E5D3"]);
  });

  specimen.it("every stated control key stands", () => {
    const stated = {
      contrast: "#000001", contrastHover: "#000002", contrastPressed: "#000003", on: "#000004", onMuted: "#000005", onPressed: "#000006",
      field: "#000007", fieldPlaceholder: "#000008", fieldCaret: "#000009", selected: "rgba(1, 2, 3, 0.1)", focus: "#00000A",
      scrollbar: "#00000B", divider: "#00000C",
    };
    specimen.expect(over({ control: stated }).control).toEqual(stated);
  });
});

specimen.describe("theme() — derive: a zone's ground", () => {
  specimen.it("a colour for a zone is its surface; sunk, lift and inverse-on take it", () => {
    const zone = theme(FLOOR).zones[1];
    specimen.expect([zone.surface, zone.surfaceSunk, zone.surfaceLift, zone.inverseOn]).toEqual(Array(4).fill("#F0EDDE"));
  });

  specimen.it("strong and divider take the boundary; soft is the boundary at .5", () => {
    const zone = over({ zones: { 1: { surface: "#F0EDDE", boundary: "#A0967C" } } }).zones[1];
    specimen.expect([zone.boundaryStrong, zone.divider, zone.boundarySoft]).toEqual(["#A0967C", "#A0967C", "rgba(160, 150, 124, 0.5)"]);
  });

  specimen.it("scrim is the sunk step at .6; inverse is the text strong", () => {
    const zone = over({ text: { strong: "#0B0F2D" }, zones: { 1: { surface: "#F0EDDE", surfaceSunk: "#E9E5D3" } } }).zones[1];
    specimen.expect([zone.scrim, zone.inverse]).toEqual(["rgba(233, 229, 211, 0.6)", "#0B0F2D"]);
  });

  specimen.it("no boundary stated anywhere: a quarter of the ink over the surface, opaque", () => {
    const zone = theme({ text: { ink: "#000000" }, signal: { primary: "#045554" }, zones: { 1: "#FFFFFF" } }).zones[1];
    specimen.expect(zone.boundary).toBe("#BFBFBF");
  });

  specimen.it("every stated ground key stands", () => {
    const stated = {
      surface: "#000001", surfaceSunk: "#000002", surfaceLift: "#000003", boundary: "#000004", boundaryStrong: "#000005",
      boundarySoft: "rgba(1, 2, 3, 0.1)", divider: "#000006", inverse: "#000007", inverseOn: "#000008",
      shadow: "rgba(1, 2, 3, 0.2)", scrim: "rgba(1, 2, 3, 0.3)", dim: 0.4,
    };
    const zone = over({ zones: { 2: stated } }).zones[2];
    for (const key of Object.keys(stated)) specimen.expect([key, zone[key]]).toEqual([key, stated[key]]);
  });
});

specimen.describe("theme() — zones: omitted, nearest, the lower on a tie", () => {
  const surfaces = (zones) => theme({ ...FLOOR, zones }).zones.map((zone) => zone.surface);
  const A = "#00000A", B = "#00000B", C = "#00000C", D = "#00000D";

  specimen.it("every subset of the four zones completes to four", () => {
    const cases = [
      [{ 0: A }, [A, A, A, A]],
      [{ 1: B }, [B, B, B, B]],
      [{ 2: C }, [C, C, C, C]],
      [{ 3: D }, [D, D, D, D]],
      [{ 0: A, 1: B }, [A, B, B, B]],
      [{ 0: A, 2: C }, [A, A, C, C]],
      [{ 0: A, 3: D }, [A, A, D, D]],
      [{ 1: B, 2: C }, [B, B, C, C]],
      [{ 1: B, 3: D }, [B, B, B, D]],
      [{ 2: C, 3: D }, [C, C, C, D]],
      [{ 0: A, 1: B, 2: C }, [A, B, C, C]],
      [{ 0: A, 1: B, 3: D }, [A, B, B, D]],
      [{ 0: A, 2: C, 3: D }, [A, A, C, D]],
      [{ 1: B, 2: C, 3: D }, [B, B, C, D]],
      [{ 0: A, 1: B, 2: C, 3: D }, [A, B, C, D]],
    ];
    for (const [zones, expected] of cases) specimen.expect([Object.keys(zones).join(""), surfaces(zones)]).toEqual([Object.keys(zones).join(""), expected]);
  });

  specimen.it("an omitted zone copies the whole of its neighbour, overrides included", () => {
    const held = over({ zones: { 1: { surface: B, dim: 0.3, size: { unit: ".2rem" }, signal: { negative: { ink: "#111111" } } } } });
    for (const zone of held.zones) {
      specimen.expect([zone.dim, zone.size.unit, zone.signal.negative.ink]).toEqual([0.3, ".2rem", "#111111"]);
    }
  });

  specimen.it("a stated zone without a surface or a boundary takes the nearest that states one", () => {
    const held = theme({ ...FLOOR, zones: { 0: { boundary: "#0000B0" }, 1: { surface: B }, 3: { surface: D, boundary: "#0000B3" } } });
    specimen.expect(held.zones.map((zone) => zone.surface)).toEqual([B, B, B, D]);
    specimen.expect(held.zones.map((zone) => zone.boundary)).toEqual(["#0000B0", "#0000B0", "#0000B3", "#0000B3"]);
  });

  specimen.it("a zone that states only an override keeps its neighbour's ground and its own override", () => {
    const held = theme({ ...FLOOR, zones: { 1: B, 3: { text: { muted: "#111111" } } } });
    specimen.expect(held.zones[3].surface).toBe(B);
    specimen.expect(held.zones[3].text.muted).toBe("#111111");
    specimen.expect(held.zones[1].text.muted).toBe(FLOOR.text.ink);
  });
});

specimen.describe("theme() — merge: a zone restates only what differs", () => {
  specimen.it("a zone overriding signal.negative.ink keeps the fill, the tint and the on", () => {
    const held = over({ signal: { negative: { fill: "#C74E31", ink: "#A23920", on: "#FBFAF2" } }, zones: { 3: { surface: "#FBFAF2", signal: { negative: { ink: "#7C2A16" } } } } });
    specimen.expect(held.zones[3].signal.negative).toEqual({ fill: "#C74E31", ink: "#7C2A16", tint: "rgba(199, 78, 49, 0.18)", on: "#FBFAF2" });
    specimen.expect(held.zones[1].signal.negative.ink).toBe("#A23920");
    specimen.expect(held.signal.negative.ink).toBe("#A23920");
  });

  specimen.it("a zone overriding a fill re-derives the ink and the tint it never stated", () => {
    const held = over({ zones: { 2: { surface: "#FBFAF2", signal: { primary: "#1EBCB5" } } } });
    specimen.expect(held.zones[2].signal.primary).toEqual({ fill: "#1EBCB5", ink: "#1EBCB5", tint: "rgba(30, 188, 181, 0.18)", on: held.zones[2].signal.primary.on });
    specimen.expect(held.zones[2].control.selected).toBe("rgba(30, 188, 181, 0.18)");
    specimen.expect(held.zones[1].signal.primary.fill).toBe("#045554");
  });

  specimen.it("a zone overriding size.unit keeps every sibling", () => {
    const held = over({ zones: { 0: { surface: "#F5F3E8", size: { unit: ".2rem" } } } });
    specimen.expect(held.zones[0].size.unit).toBe(".2rem");
    specimen.expect({ ...held.zones[0].size, unit: ".25rem" }).toEqual(held.size);
    specimen.expect(held.zones[1].size.unit).toBe(".25rem");
  });

  specimen.it("a zone overriding text.strong moves its own inverse and its own control label", () => {
    const held = over({ text: { strong: "#0B0F2D" }, zones: { 3: { surface: "#FBFAF2", text: { strong: "#111111" } } } });
    specimen.expect([held.zones[3].inverse, held.zones[3].control.on]).toEqual(["#111111", "#111111"]);
    specimen.expect([held.zones[1].inverse, held.zones[1].control.on]).toEqual(["#0B0F2D", "#0B0F2D"]);
  });

  specimen.it("a zone overriding radius by shorthand rescales that zone alone", () => {
    const held = over({ zones: { 2: { surface: "#FBFAF2", shape: { radius: "0px", relief: "sunk" } } } });
    specimen.expect(held.zones[2].shape.radius.md).toBe("0px");
    specimen.expect(held.zones[2].shape.relief).toBe("sunk");
    specimen.expect(held.zones[1].shape.radius.md).toBe("4px");
  });

  specimen.it("the theme's own groups carry no zone's override", () => {
    const held = over({ zones: { 1: { surface: "#F0EDDE", text: { ink: "#111111" }, size: { unit: ".5rem" } } } });
    specimen.expect([held.text.ink, held.size.unit]).toEqual([FLOOR.text.ink, ".25rem"]);
    specimen.expect([held.zones[1].text.ink, held.zones[1].size.unit]).toEqual(["#111111", ".5rem"]);
  });
});

specimen.describe("theme() — layers", () => {
  specimen.it("layers merge left to right, per key", () => {
    const held = theme(FLOOR, { text: { strong: "#111111" } }, { text: { strong: "#222222", muted: "#333333" } });
    specimen.expect([held.text.strong, held.text.ink, held.text.muted]).toEqual(["#222222", FLOOR.text.ink, "#333333"]);
  });

  specimen.it("a later shorthand and an earlier object meet per key", () => {
    const held = theme(FLOOR, { signal: { primary: { fill: "#111111", ink: "#222222" } } }, { signal: { primary: "#333333" } });
    specimen.expect([held.signal.primary.fill, held.signal.primary.ink]).toEqual(["#333333", "#222222"]);
  });

  specimen.it("a zone stated across two layers is one zone", () => {
    const held = theme(FLOOR, { zones: { 1: { boundary: "#A0967C" } } }, { zones: { 1: { dim: 0.2 } } });
    specimen.expect([held.zones[1].surface, held.zones[1].boundary, held.zones[1].dim]).toEqual(["#F0EDDE", "#A0967C", 0.2]);
  });

  specimen.it("the floor may be reached across layers", () => {
    specimen.expect(Theme.check(theme({ text: FLOOR.text }, { signal: FLOOR.signal }, { zones: FLOOR.zones }))).toBe(true);
  });
});

specimen.describe("theme() — purity", () => {
  specimen.it("no definition is mutated", () => {
    const layers = [structuredClone(SPARSE), { zones: { 2: "#FBFAF2" }, shape: { radius: "1px" } }];
    const before = structuredClone(layers);
    theme(...layers);
    specimen.expect(layers).toEqual(before);
  });

  specimen.it("two calls return equal themes that share nothing", () => {
    const first = theme(SPARSE);
    const second = theme(SPARSE);
    specimen.expect(first).toEqual(second);
    first.zones[0].size.space.sm = 99;
    first.text.ink = "#000000";
    specimen.expect(second.zones[0].size.space.sm).toBe(3);
    specimen.expect(second.text.ink).toBe("#3D372A");
  });

  specimen.it("zones of one theme share nothing with each other or with the root", () => {
    const held = theme(FLOOR);
    held.zones[0].shape.radius.md = "99px";
    specimen.expect(held.zones[1].shape.radius.md).toBe("4px");
    specimen.expect(held.shape.radius.md).toBe("4px");
  });
});

specimen.describe("theme() — the sparse definition, key by key", () => {
  const held = theme(SPARSE);
  const expected = [
    ["text.header", held.text.header, "#0B0F2D"],
    ["text.ink", held.text.ink, "#3D372A"],
    ["text.light", held.text.light, "#3D372A"],
    ["text.link", held.text.link, "#045554"],
    ["text.code", held.text.code, "#AC575C"],
    ["shape.relief", held.shape.relief, "sunk"],
    ["shape.radius.card", held.shape.radius.card, "xs"],
    ["shape.radius.xs", held.shape.radius.xs, "3px"],
    ["shape.lift", held.shape.lift, "0 12px 30px"],
    ["size.unit", held.size.unit, ".3rem"],
    ["size.type.md", held.size.type.md, "1.0625rem"],
    ["size.space.sm", held.size.space.sm, 3],
    ["signal.primary.tint", held.signal.primary.tint, "rgba(4, 85, 84, 0.18)"],
    ["signal.negative.ink", held.signal.negative.ink, "#A23920"],
    ["control.contrastHover", held.control.contrastHover, "#DAD4C0"],
    ["control.on", held.control.on, "#0B0F2D"],
    ["zones[0].size.unit", held.zones[0].size.unit, ".2rem"],
    ["zones[1].size.unit", held.zones[1].size.unit, ".3rem"],
    ["zones[0].boundary", held.zones[0].boundary, "#A0967C"],
    ["zones[2].surface", held.zones[2].surface, "#F0EDDE"],
    ["zones[2].boundary", held.zones[2].boundary, "#A0967C"],
    ["zones[3].surface", held.zones[3].surface, "#FBFAF2"],
    ["zones[3].boundary", held.zones[3].boundary, "#A0967C"],
    ["zones[3].signal.negative.ink", held.zones[3].signal.negative.ink, "#A23920"],
  ];
  for (const [key, got, wanted] of expected) {
    specimen.it(key, () => specimen.expect(got).toBe(wanted));
  }
});

specimen.describe("theme() — the two themes dapper ships", () => {
  specimen.it("northsea and parchment pass Theme", () => {
    for (const [name, held] of Object.entries(THEMES)) specimen.expect([name, Theme.faults(held)]).toEqual([name, []]);
  });

  specimen.it("northsea, parchment and the sparse definition complete to one key set", () => {
    const keys = paths(theme(SPARSE));
    specimen.expect(keys).toHaveLength(94 + 4 * 106);
    for (const held of Object.values(THEMES)) specimen.expect(paths(held)).toEqual(keys);
  });

  specimen.it("every zone of every theme passes Zone and emits 106 declarations", () => {
    for (const [name, held] of Object.entries(THEMES)) {
      held.zones.forEach((zone, index) => {
        specimen.expect([name, index, Zone.faults(zone), declarations(zone).length]).toEqual([name, index, [], 106]);
      });
    }
  });

  specimen.it("northsea's zone 3 overrides the negative ink and nothing else of the signal", () => {
    const { northsea } = THEMES;
    specimen.expect(northsea.zones[3].signal.negative).toEqual({ ...northsea.signal.negative, ink: "#EBCDC0" });
    for (const index of [0, 1, 2]) specimen.expect(northsea.zones[index].signal).toEqual(northsea.signal);
  });

  specimen.it("northsea's zone 3, whole, is the quest's witness", () => {
    const zone = THEMES.northsea.zones[3];
    specimen.expect(Object.fromEntries(Object.entries(zone).filter(([, held]) => !plain(held)))).toEqual({
      surface: "#1A2A38", surfaceSunk: "#0E1A25", surfaceLift: "#243544",
      boundary: "#384A5E", boundaryStrong: "#6B7E91", boundarySoft: "rgba(56, 74, 94, 0.5)",
      divider: "#243544", inverse: "#E6EAEF", inverseOn: "#1A2A38",
      shadow: "rgba(0, 0, 0, 0.45)", scrim: "rgba(14, 26, 37, 0.6)", dim: 0.55,
    });
    specimen.expect(zone.control.selected).toBe("rgba(30, 188, 181, 0.18)");
    specimen.expect(SIGNALS.map((name) => zone.signal[name].tint)).toEqual([
      "rgba(30, 188, 181, 0.18)", "rgba(135, 181, 106, 0.18)", "rgba(212, 160, 84, 0.18)", "rgba(190, 112, 85, 0.18)",
    ]);
  });

  specimen.it("northsea's island states its own inverse and dim", () => {
    specimen.expect([THEMES.northsea.zones[2].inverse, THEMES.northsea.zones[2].dim]).toEqual(["#CFD6DE", 0.5]);
  });

  specimen.it("parchment carries its own shadow tone in every zone", () => {
    specimen.expect(THEMES.parchment.zones.map((zone) => zone.shadow)).toEqual(Array(4).fill("rgba(61, 55, 42, 0.16)"));
  });

  specimen.it("the four surfaces of each theme are four territories", () => {
    specimen.expect(THEMES.northsea.zones.map((zone) => zone.surface)).toEqual(["#0E1A25", "#06101D", "#060D14", "#1A2A38"]);
    specimen.expect(THEMES.parchment.zones.map((zone) => zone.surface)).toEqual(["#F0EDDE", "#F5F3E8", "#FBFAF2", "#E9E5D3"]);
  });

  specimen.it("a theme's root groups equal its body zone's", () => {
    for (const [name, held] of Object.entries(THEMES)) {
      for (const group of ["shape", "size", "text", "control", "signal"]) {
        specimen.expect([name, group, held.zones[1][group]]).toEqual([name, group, held[group]]);
      }
    }
  });
});

specimen.describe("theme() — fonts", () => {
  const FAMILIES = { sansHeading: "Poppins, sans-serif", sansText: "Inter, sans-serif", serifHeading: "Poppins, serif", serifText: "Inter, Sabon, serif", brand: "K2D, sans-serif", code: "Victor Mono, monospace" };

  specimen.it("the floor completes to the six default families, in every zone", () => {
    const held = theme(FLOOR);
    specimen.expect(held.font.family).toEqual(FAMILIES);
    for (const zone of held.zones) specimen.expect(zone.font.family).toEqual(FAMILIES);
  });

  specimen.it("a stated family reaches every zone and leaves the other five at their defaults", () => {
    const held = over({ font: { family: { code: "IBM Plex Mono, monospace" } } });
    specimen.expect(held.zones.map((zone) => zone.font.family.code)).toEqual(Array(4).fill("IBM Plex Mono, monospace"));
    specimen.expect(held.zones[2].font.family.sansText).toBe("Inter, sans-serif");
  });

  specimen.it("a zone stating a family overrides its own block alone", () => {
    const held = over({ font: { family: { code: "IBM Plex Mono, monospace" } }, zones: { 0: "#E9E5D3", 2: { surface: "#FBFAF2", font: { family: { code: "Space Mono, monospace" } } }, 3: "#DAD4C0" } });
    specimen.expect(held.zones.map((zone) => zone.font.family.code)).toEqual(["IBM Plex Mono, monospace", "IBM Plex Mono, monospace", "Space Mono, monospace", "IBM Plex Mono, monospace"]);
  });

  specimen.it("an empty family and an unknown family name are refused", () => {
    specimen.expect(() => over({ font: { family: { code: "" } } })).toThrow();
    specimen.expect(() => over({ font: { family: { mono: "Space Mono, monospace" } } })).toThrow();
  });
});

specimen.describe("porcelain · datasette — the designer's two", () => {
  const { porcelain, datasette } = THEMES;

  specimen.it("both pass Theme, every zone 106 declarations", () => {
    for (const [name, held] of Object.entries({ porcelain, datasette })) {
      specimen.expect([name, Theme.faults(held)]).toEqual([name, []]);
      held.zones.forEach((zone, index) => specimen.expect([name, index, declarations(zone).length]).toEqual([name, index, 106]));
    }
  });

  specimen.it("porcelain's chrome is dark, its body light", () => {
    specimen.expect([porcelain.zones[0].surface, porcelain.zones[1].surface, porcelain.zones[0].text.header, porcelain.zones[1].text.header]).toEqual(["#0E1A25", "#EDF0F4", "#FFFFFF", "#0E1A25"]);
  });

  specimen.it("the floor fixes read back: tints stated, the chrome's muted label and focus ring raised", () => {
    specimen.expect([porcelain.signal.primary.tint, porcelain.zones[3].signal.negative.tint, porcelain.zones[0].control.onMuted]).toEqual(["rgba(61, 82, 140, 0.1)", "rgba(164, 65, 42, 0.1)", "#5F7286"]);
    specimen.expect([datasette.signal.primary.tint, datasette.zones[3].signal.positive.tint, datasette.zones[0].control.focus]).toEqual(["rgba(200, 64, 26, 0.14)", "rgba(47, 122, 58, 0.14)", "#F0A18B"]);
  });

  specimen.it("each names its own families, in every zone", () => {
    specimen.expect(porcelain.zones.map((zone) => [zone.font.family.sansText, zone.font.family.code])).toEqual(Array(4).fill(["IBM Plex Sans, sans-serif", "IBM Plex Mono, monospace"]));
    specimen.expect(datasette.zones.map((zone) => [zone.font.family.sansHeading, zone.font.family.code])).toEqual(Array(4).fill(["VT323, Space Mono, monospace", "Space Mono, monospace"]));
  });

  specimen.it("parchment re-tuned: a paper 50 key, rounder corners, a softer divider per zone", () => {
    const { parchment } = THEMES;
    specimen.expect([parchment.control.contrast, parchment.control.contrastHover, parchment.control.contrastPressed]).toEqual(["#FBFAF2", "#F5F3E8", "#DAD4C0"]);
    specimen.expect(parchment.zones.map((zone) => zone.divider)).toEqual(["#E9E5D3", "#F0EDDE", "#F5F3E8", "#DAD4C0"]);
    for (const zone of parchment.zones) specimen.expect([zone.shape.radius.key, zone.shape.radius.md, zone.shape.label.track, zone.shape.lift, zone.size.row]).toEqual(["md", "7px", ".12em", "0 8px 24px", 7]);
  });
});
