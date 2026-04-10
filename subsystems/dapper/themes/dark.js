import { skeleton } from "../lib/builders.js";

export default async function (ds) {
  const { iron, deep, gold, aqua, indigo, moss, amber, rust, pink } =
    ds.colors.roots;

  ds.themes.dark = { ...ds.tokens };

  const font = {
    heading: "sans-heading",
    body:    "sans-text",
    code:    "code",
  };

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
    surface:  deep[800],
    contrast: gold[200],
    boundary: aqua[400],
    roles:    standardRoles,
    error:    standardError,
    font,
  });

  const zone1 = skeleton({
    surface:  iron[850],
    contrast: iron[100],
    boundary: aqua[400],
    roles:    standardRoles,
    error:    standardError,
    font,
  });

  const zone2 = skeleton({
    surface:  iron[900],
    contrast: iron[200],
    boundary: iron[700],
    roles:    standardRoles,
    error:    standardError,
    font,
  });

  const zone3 = skeleton({
    surface:  iron[800],
    contrast: iron[100],
    boundary: iron[600],
    roles:    standardRoles,
    error:    standardError,
    font,
  });

  const zone4 = skeleton({
    surface:  iron[700],
    contrast: iron[100],
    boundary: aqua[300],
    roles: {
      ...standardRoles,
      primary:   { ramp: aqua,   anchor: 200 },
      secondary: { ramp: indigo, anchor: 200 },
      accent:    { ramp: pink,   anchor: 200 },
      info:      { ramp: indigo, anchor: 200 },
      success:   { ramp: moss,   anchor: 200 },
      warning:   { ramp: amber,  anchor: 200 },
    },
    error: { ramp: rust, anchors: [700, 100, 300] },
    font,
  });

  const zone5 = skeleton({
    surface:  iron[950],
    contrast: iron[100],
    boundary: iron[800],
    roles:    standardRoles,
    error:    standardError,
    font,
  });

  ds.themes.dark.zones = [zone0, zone1, zone2, zone3, zone4, zone5];
  ds.themes.dark.fonts = { heading: font.heading, body: font.body, code: font.code };

  const palette = ds.colors.palette;
  const compat = (ramp) => ({ surface: ramp[500], contrast: ramp[200], boundary: ramp[300] });

  ds.themes.dark.colors = {
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
