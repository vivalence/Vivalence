// ============================================================================
// Dark theme — flat scoped skeletons.
//
// Five skeletons (0..4), each a self-contained universe of {surface, contrast,
// boundary, primary, secondary, accent, info, success, warning, danger, error,
// font}. The old top-level `theme` and `system` groups are gone — those colors
// now live inside each skeleton, scoped to its pane.
//
// Hierarchy:
//   0  T-bone + H overlay        — warm dark blue + pale iron-gold
//   1  Panel A (main work area)  — main canvas, modes render here
//   2  Panels B + E              — slightly darker than 3
//   3  Panels D + F + twigs      — slightly brighter than 2
//   4  Overlay G + frame of 1    — variant of 1, renders on top
//
// See .ikiro/pincer.workpackage.org § Dapper Skeleton Rebuild.
// ============================================================================

import { skeleton } from "../primitives/builders.js";

export default async function (ds) {
  const { iron, deep, gold, aqua, indigo, moss, amber, rust, pink } =
    ds.colors.roots;

  ds.themes.dark = { ...ds.tokens };

  // shared font tokenspace — every skeleton uses the same family map.
  // Components pick by role (heading/body/code), not by skeleton.
  const font = {
    heading: "sans-heading", // Poppins
    body:    "sans-text",    // Inter
    code:    "code",         // Source Code Pro
  };

  // shared interactive role anchors. Skeletons override only what differs.
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

  ds.themes.dark.colors = {
    // keep palette + roots accessible for escape hatches and debugging
    palette: ds.colors.palette,
    roots:   ds.colors.roots,

    // five skeletons — each a flat populated universe
    // singular `skeleton` matches the old key name and produces clean CSS
    // var names: --colors-skeleton-N-role[-state]
    skeleton: {
      // skeleton 0 — T-bone + H overlay
      // deep warm blue surface, pale iron-gold lettering, teal seam
      0: skeleton({
        surface:  deep[800],
        contrast: gold[200],
        boundary: aqua[400],
        roles:    standardRoles,
        error:    standardError,
        font,
      }),

      // skeleton 1 — main work area (panel A, where modes render)
      // deep wet concrete with pale iron text, teal accents
      1: skeleton({
        surface:  iron[850],
        contrast: iron[100],
        boundary: aqua[400],
        roles:    standardRoles,
        error:    standardError,
        font,
      }),

      // skeleton 2 — panels B + E (slightly darker than 3)
      2: skeleton({
        surface:  iron[900],
        contrast: iron[200],
        boundary: iron[700],
        roles:    standardRoles,
        error:    standardError,
        font,
      }),

      // skeleton 3 — panels D + F + twigs (slightly brighter than 2)
      3: skeleton({
        surface:  iron[800],
        contrast: iron[100],
        boundary: iron[600],
        roles:    standardRoles,
        error:    standardError,
        font,
      }),

      // skeleton 4 — overlay G + frame contents of 1 (variant of 1, on top)
      4: skeleton({
        surface:  iron[700],
        contrast: iron[100],
        boundary: aqua[300],
        roles: {
          ...standardRoles,
          // brighter anchors so overlays read above their host pane
          primary:   { ramp: aqua,   anchor: 200 },
          secondary: { ramp: indigo, anchor: 200 },
          accent:    { ramp: pink,   anchor: 200 },
          info:      { ramp: indigo, anchor: 200 },
          success:   { ramp: moss,   anchor: 200 },
          warning:   { ramp: amber,  anchor: 200 },
        },
        error: { ramp: rust, anchors: [700, 100, 300] },
        font,
      }),
    },
  };

  return ds;
}

// export default async function (ds) {
//   const palette = ds.colors.palette;

//   ds.themes.dark = { ...ds.tokens };

//   ds.themes.dark.color = {
//     palette,
//     system: {
//       info: {
//         text: palette.indigo["400"],
//         bg: palette.indigo["300"],
//         border: palette.indigo["50"],
//         hover: {
//           text: palette.indigo["500"],
//           bg: palette.indigo["500"],
//           border: palette.indigo["100"],
//         },

//         // depracated
//         1: palette.indigo["400"],
//         2: palette.indigo["300"],
//         3: palette.indigo["50"],
//       },
//       success: {
//         text: palette.lime["400"],
//         bg: palette.lime["300"],
//         border: palette.lime["50"],
//         hover: {
//           text: palette.lime["500"],
//           bg: palette.lime["500"],
//           border: palette.lime["100"],
//         },

//         // depracated
//         1: palette.lime["400"],
//         2: palette.lime["300"],
//         3: palette.lime["50"],
//       },
//       warning: {
//         text: palette.amber["400"],
//         bg: palette.amber["300"],
//         border: palette.amber["50"],
//         hover: {
//           text: palette.amber["500"],
//           bg: palette.amber["500"],
//           border: palette.amber["100"],
//         },

//         // depracated
//         1: palette.amber["400"],
//         2: palette.amber["300"],
//         3: palette.amber["50"],
//       },
//       danger: {
//         text: palette.red["400"],
//         bg: palette.red["300"],
//         border: palette.red["50"],
//         hover: {
//           text: palette.red["500"],
//           bg: palette.red["500"],
//           border: palette.red["100"],
//         },

//         // depracated
//         1: palette.red["400"],
//         2: palette.red["300"],
//         3: palette.red["50"],
//       },
//       disabled: {
//         1: palette.gray[600],
//         2: palette.gray[300],
//         3: palette.gray[200],

//         // depracated
//         1: palette.gray[600],
//         2: palette.gray[300],
//         3: palette.gray[200],
//       },
//     },
//     interactive: {
//       // not using actively
//       active: {
//         accent: palette.pink[300],
//         primary: palette.gray[10],
//         secondary: palette.gray[800],
//         inverse: palette.gray[10],
//         ui: palette.gray[600],
//         border: palette.indigo[300],
//         field: palette.gray[800],
//       },
//       hover: {
//         accent: palette.pink[700],
//         primary: palette.aqua[100],
//         secondary: palette.gray[500],
//         inverse: palette.gray[0],
//         ui: palette.gray[600],
//         field: palette.gray[600],
//       },
//       focus: {
//         accent: palette.pink[100],
//         secondary: palette.amber[50],
//         danger: palette.red[50],
//       },
//     },
//     skeleton: {
//       // should grow!
//       // bg ui borders
//       1: palette.gray[500],
//       2: palette.gray[300],
//     },
//     theme: {
//       accent: palette.pink[400],
//       // ["accent-contrast"]: palette.pink[100],
//       // ["accent-hover ...?bg?txt?"]: palette.pink[100],

//       primary: palette.aqua[300],
//       secondary: palette.aqua[400],
//       contrast: palette.gray[300],
//       link: palette.indigo.DEFAULT,
//       text: {
//         accent: palette.pink[900],
//         primary: palette.gray[100],
//         secondary: palette.gray[100],
//         placeholder: palette.gray[100],
//         contrast: palette.white,
//         hint: palette.gray[200],
//         disabled: palette.gray[100],
//         success: palette.lime[300],
//         warning: palette.amber[300],
//         danger: palette.red[300],
//         inverse: palette.gray[100],
//         1: palette.gray[100],
//         2: palette.gray[800],
//         3: palette.gray[500],
//         4: palette.black,
//       },
//       icon: {
//         1: palette.gray[10],
//         2: palette.gray[90],
//         3: palette.aqua[200],
//         contrast: palette.white,
//         disabled: palette.gray[200],
//         inverse: palette.gray[900],
//       },
//       ui: {
//         background: palette.gray[900],
//         1: palette.gray[800],
//         2: palette.gray[100],
//         3: palette.gray[500],
//         4: palette.white,
//         // 5: palette.gray[200],
//         // 6: palette.white,
//         overlay: palette.gray[100],
//       },
//       border: {
//         1: palette.gray[600],
//         2: palette.gray[400],
//         3: palette.gray[300],
//         4: palette.gray[30],
//       },
//       field: {
//         1: palette.gray[800],
//         2: palette.gray[600],
//       },
//     },
//   };

//   return ds;
// }
