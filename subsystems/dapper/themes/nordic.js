import { skeleton } from "../lib/builders.js";

// Nordic — dark scandinavian. Depth reads by luminance on a monotonic ladder;
// hue is reserved for meaning. Boundaries are always neutral iron: an accent
// used as structural chrome is an accent that can no longer signal state.
//
// zone roles
//   0 canvas   — the conversation field (deep navy, the only non-iron surface)
//   1 panel    — docked panels, the default chrome
//   2 recess   — lists/trees sunk below panel level
//   3 raised   — cards floating above panel level
//   4 accent   — selection, active row, focused input
//   5 overlay  — popovers, modals, anything above the app

export default async function (ds) {
  const { iron, deep, aqua, indigo, moss, amber, rust, pink } = ds.colors.roots;

  ds.themes.nordic = { ...ds.tokens };

  const font = {
    heading: "sans-heading",
    body:    "sans-text",
    code:    "code",
  };

  // One anchor across every zone. The ladder spans ~5% to ~14% luminance, so a
  // single accent value stays legible on all of it — no per-zone retuning.
  const standardRoles = {
    primary:   { ramp: aqua,   anchor: 300 },
    secondary: { ramp: indigo, anchor: 300 },
    accent:    { ramp: pink,   anchor: 300 },
    info:      { ramp: indigo, anchor: 300 },
    success:   { ramp: moss,   anchor: 300 },
    warning:   { ramp: amber,  anchor: 300 },
    danger:    { ramp: rust,   anchor: 300 },
  };

  const standardError = { ramp: rust, anchors: [800, 100, 300] };

  const zone0 = skeleton({
    surface:  deep[900],
    contrast: iron[100],
    boundary: iron[800],
    roles:    standardRoles,
    error:    standardError,
    font,
  });

  const zone1 = skeleton({
    surface:  iron[900],
    contrast: iron[100],
    boundary: iron[800],
    roles:    standardRoles,
    error:    standardError,
    font,
  });

  const zone2 = skeleton({
    surface:  iron[950],
    contrast: iron[200],
    boundary: iron[850],
    roles:    standardRoles,
    error:    standardError,
    font,
  });

  const zone3 = skeleton({
    surface:  iron[850],
    contrast: iron[100],
    boundary: iron[700],
    roles:    standardRoles,
    error:    standardError,
    font,
  });

  const zone4 = skeleton({
    surface:  iron[800],
    contrast: iron[50],
    boundary: iron[600],
    roles:    standardRoles,
    error:    standardError,
    font,
  });

  const zone5 = skeleton({
    surface:  deep[950],
    contrast: iron[100],
    boundary: iron[850],
    roles:    standardRoles,
    error:    standardError,
    font,
  });

  ds.themes.nordic.zones = [zone0, zone1, zone2, zone3, zone4, zone5];
  ds.themes.nordic.fonts = { heading: font.heading, body: font.body, code: font.code };

  ds.themes.nordic.shadow = {
    soft:   "rgba(0, 0, 0, 0.45)",
    strong: "rgba(0, 0, 0, 0.7)",
  };
  ds.themes.nordic.mix = {
    deep: "#000000",
  };
  ds.themes.nordic.filter = {
    brand: "brightness(0) saturate(100%) invert(72%) sepia(45%) saturate(1156%) hue-rotate(133deg) brightness(94%) contrast(89%) drop-shadow(0 0 4px " + aqua[300] + ")",
  };
  ds.themes.nordic.signal = {
    positive: moss[300],
    caution:  amber[300],
    negative: rust[300],
  };
  ds.themes.nordic.brand = {
    outline: aqua[300],
  };

  // Text ramp — same contract as paper.text: sub-levels of emphasis inside a
  // zone. Measured against iron 900, the brightest panel surface in the ladder.
  //   primary  iron 100   headings, values, active rows
  //   body     iron 300   prose, list items
  //   support  iron 400   labels, secondary values, timestamps
  ds.themes.nordic.text = {
    primary: iron[100],
    body:    iron[300],
    support: iron[400],
  };

  const palette = ds.colors.palette;
  const compat = (ramp) => ({ surface: ramp[500], contrast: ramp[200], boundary: ramp[300] });

  ds.themes.nordic.colors = {
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
      success: compat(palette.lime),
      warning: compat(palette.amber),
      danger:  compat(palette.red),
      error:   compat(palette.red),
    },
  };

  return ds;
}
