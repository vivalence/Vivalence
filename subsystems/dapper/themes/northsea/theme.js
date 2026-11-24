import { theme } from "../../lib/theme.js";
import { iron, deep, aqua, moss, amber, rust } from "./gradients.js";

export default theme({
  shape:   { relief: "lift", radius: { key: "2xs", field: "2xs", card: "xs", pill: "2xs", disc: "2xs" } },
  text:    { header: iron[50], strong: iron[100], ink: iron[300], light: iron[400], muted: iron[500], link: aqua[200], code: amber[200] },
  control: { contrast: iron[700], contrastHover: iron[600], contrastPressed: iron[800], on: iron[100], onMuted: iron[400], onPressed: aqua[200],
             field: iron[950], fieldPlaceholder: iron[500], fieldCaret: aqua[300], focus: aqua[200], scrollbar: iron[700], divider: iron[800] },
  signal:  { primary:  { fill: aqua[300],  ink: aqua[200],  on: iron[950] },
             positive: { fill: moss[300],  ink: moss[200],  on: iron[950] },
             caution:  { fill: amber[300], ink: amber[200], on: iron[950] },
             negative: { fill: rust[300],  ink: rust[200],  on: iron[950] } },
  brand:   { glow: "inset 0 0 12px rgba(30, 188, 181, 0.2)", filter: `drop-shadow(0 0 4px ${aqua[300]})` },
  zones: {
    0: { plane: iron[900], planeSunk: iron[950], planeLift: iron[850], boundary: iron[800], boundaryStrong: iron[600], divider: iron[850] },
    1: { plane: deep[900], planeSunk: deep[950], planeLift: deep[850], boundary: iron[800], boundaryStrong: iron[600], divider: iron[850] },
    2: { plane: iron[950], planeSunk: deep[950], planeLift: iron[900], boundary: iron[850], boundaryStrong: iron[700], divider: iron[900], inverse: iron[200], dim: .5 },
    3: { plane: iron[850], planeSunk: iron[900], planeLift: iron[800], boundary: iron[700], boundaryStrong: iron[500], divider: iron[800],
         signal: { negative: { ink: rust[100] } } },
  },
});
