import { skeleton } from "../lib/builders.js";

// Paper — leuchtturm ivory, kaweco ink.
//
// v2 legibility rules (the previous pass failed all three):
//   1. Type never uses a saturated hue. Body is near-black ink; support text is
//      warm grey from the paper ramp. Royal ink 500/600 is a *signal* colour
//      (mode lines, links) — at 15px it reads as decoration, not prose.
//   2. Nothing lighter than paper 700 (#5A5240) is ever a text colour. Ratios
//      are quoted against paper 300 — the darkest surface in the ladder — not
//      against the canvas, so a tone that passes passes everywhere. paper 600
//      and lighter are rules, dividers and icons only; the old theme set
//      labels and values at ~2.9:1, which is what made it unreadable.
//   3. Interactive anchors sit at 500-700, not 400. aqua 400 measures ~3:1 on
//      ivory; aqua 600 clears 7:1 and works as fill *and* as text.
//
// zone roles
//   0 canvas   — the conversation field
//   1 panel    — docked panels
//   2 recess   — lists/trees sunk below panel level
//   3 raised   — cards floating above panel level (brightest)
//   4 accent   — selection, active row, focused input
//   5 overlay  — popovers, modals

export default async function (ds) {
  const { paper, ink, aqua, moss, amber, rust, pink } = ds.colors.roots;

  ds.themes.paper = { ...ds.tokens };

  const font = {
    heading: "sans-heading",
    body:    "sans-text",
    code:    "code",
  };

  const standardRoles = {
    primary:   { ramp: aqua,   anchor: 600 },
    secondary: { ramp: ink,    anchor: 700 },
    accent:    { ramp: pink,   anchor: 600 },
    info:      { ramp: ink,    anchor: 700 },
    success:   { ramp: moss,   anchor: 700 },
    warning:   { ramp: amber,  anchor: 700 },
    danger:    { ramp: rust,   anchor: 600 },
  };

  // tinted box: pale surface, dark text, mid-value rule that is actually visible
  const standardError = { ramp: rust, anchors: [50, 700, 300] };

  const zone0 = skeleton({
    surface:  paper[100],
    contrast: ink[900],
    boundary: paper[500],
    roles:    standardRoles,
    error:    standardError,
    font,
  });

  const zone1 = skeleton({
    surface:  paper[150],
    contrast: ink[900],
    boundary: paper[500],
    roles:    standardRoles,
    error:    standardError,
    font,
  });

  const zone2 = skeleton({
    surface:  paper[200],
    contrast: ink[900],
    boundary: paper[400],
    roles:    standardRoles,
    error:    standardError,
    font,
  });

  const zone3 = skeleton({
    surface:  paper[50],
    contrast: ink[900],
    boundary: paper[400],
    roles:    standardRoles,
    error:    standardError,
    font,
  });

  const zone4 = skeleton({
    surface:  paper[300],
    contrast: ink[950],
    boundary: paper[600],
    roles:    standardRoles,
    error:    standardError,
    font,
  });

  const zone5 = skeleton({
    surface:  paper[50],
    contrast: ink[900],
    boundary: paper[600],
    roles:    standardRoles,
    error:    standardError,
    font,
  });

  ds.themes.paper.zones = [zone0, zone1, zone2, zone3, zone4, zone5];
  ds.themes.paper.fonts = { heading: font.heading, body: font.body, code: font.code };

  ds.themes.paper.shadow = {
    soft:   "rgba(61, 55, 42, 0.16)",
    strong: "rgba(61, 55, 42, 0.28)",
  };
  ds.themes.paper.mix = {
    deep: "#5A5240",
  };
  ds.themes.paper.filter = {
    brand: "drop-shadow(0 1px 2px rgba(61, 55, 42, 0.25))",
  };
  ds.themes.paper.signal = {
    positive: moss[500],
    caution:  amber[500],
    negative: rust[500],
  };
  ds.themes.paper.brand = {
    outline: paper[500],
  };
  ds.themes.paper["box-shadow"] = {
    sm:      "0 1px 2px rgba(61, 55, 42, 0.10)",
    DEFAULT: "0 1px 3px rgba(61, 55, 42, 0.14)",
    md:      "0 2px 6px rgba(61, 55, 42, 0.16)",
    lg:      "0 4px 12px rgba(61, 55, 42, 0.20)",
    xl:      "0 8px 24px rgba(61, 55, 42, 0.24)",
  };
  ds.themes.paper["drop-shadow"] = {
    sm:      "0 1px 2px rgba(61, 55, 42, 0.10)",
    DEFAULT: "0 1px 3px rgba(61, 55, 42, 0.14)",
    md:      "0 2px 6px rgba(61, 55, 42, 0.16)",
    lg:      "0 4px 12px rgba(61, 55, 42, 0.20)",
    xl:      "0 8px 24px rgba(61, 55, 42, 0.24)",
    none:    "0 0 #0000",
  };

  // Text ramp — consumed by components that need sub-levels of emphasis inside
  // a zone. Ratios measured against paper 300, the darkest surface in the
  // ladder (on the paper 100 canvas they run 16.8 / 10.6 / 7.0).
  //   primary  ink   900  11.8:1   headings, values, active rows
  //   body     paper 800   8.0:1   prose, list items
  //   support  paper 700   5.3:1   labels, secondary values, timestamps
  // There is no fainter tier: paper 600 measures 3.8:1 on the recess surface,
  // which is below the floor for normal text.
  ds.themes.paper.text = {
    primary: ink[900],
    body:    paper[800],
    support: paper[700],
  };

  const palette = ds.colors.palette;
  const compat = (ramp) => ({ surface: ramp[100], contrast: ramp[600], boundary: ramp[300] });

  ds.themes.paper.colors = {
    palette,
    roots:   ds.colors.roots,
    skeleton: { 0: zone0, 1: zone1, 2: zone2, 3: zone3, 4: zone4 },

    theme: {
      primary:   compat(palette.aqua),
      secondary: compat(palette.indigo),
      accent:    compat(palette.pink),
    },

    system: {
      info:    compat(palette.indigo),
      success: { surface: moss[100], contrast: moss[500], boundary: moss[300] },
      warning: compat(palette.amber),
      danger:  compat(palette.red),
      error:   compat(palette.red),
    },
  };

  return ds;
}
