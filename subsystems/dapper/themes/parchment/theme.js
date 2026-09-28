import { theme } from "../../lib/theme.js";
import { paper, ink, aqua, moss, rose, tomato } from "./gradients.js";

const shadow = "rgba(61, 55, 42, 0.16)";

export default theme({
  shape:   { radius: { "2xs": "2px", xs: "4px", sm: "5px", md: "7px", lg: "10px", xl: "14px", "2xl": "18px", "3xl": "24px", key: "md", field: "md", card: "lg", pill: "full", disc: "full" },
             label: { track: ".12em" }, lift: "0 8px 24px" },
  size:    { row: 7 },
  text:    { header: ink[950], strong: ink[900], ink: paper[800], light: paper[700], muted: paper[600], link: aqua[600], code: rose[600] },
  control: { contrast: paper[50], contrastHover: paper[100], contrastPressed: paper[300], on: ink[900], onMuted: paper[700], onPressed: aqua[700],
             field: paper[50], fieldPlaceholder: paper[600], fieldCaret: aqua[600], focus: aqua[600], scrollbar: paper[400], divider: paper[400] },
  signal:  { primary:  { fill: aqua[500],   ink: aqua[600],   on: paper[50] },
             positive: { fill: moss[500],   ink: moss[600],   on: paper[50] },
             caution:  { fill: rose[500],   ink: rose[600],   on: paper[50] },
             negative: { fill: tomato[500], ink: tomato[600], on: paper[50] } },
  brand:   { outline: paper[500], filter: `drop-shadow(0 1px 2px ${shadow})` },
  zones: {
    0: { surface: paper[150], surfaceSunk: paper[200], surfaceLift: paper[100], boundary: paper[500], boundaryStrong: paper[600], divider: paper[200], shadow },
    1: { surface: paper[100], surfaceSunk: paper[150], surfaceLift: paper[50],  boundary: paper[500], boundaryStrong: paper[600], divider: paper[150], shadow },
    2: { surface: paper[50],  surfaceSunk: paper[100], surfaceLift: paper[50],  boundary: paper[400], boundaryStrong: paper[600], divider: paper[100], shadow },
    3: { surface: paper[200], surfaceSunk: paper[300], surfaceLift: paper[100], boundary: paper[400], boundaryStrong: paper[600], divider: paper[300], shadow },
  },
});
