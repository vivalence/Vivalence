import { theme } from "../../lib/theme.js";

const plex = { sans: "IBM Plex Sans, sans-serif", mono: "IBM Plex Mono, monospace" };

export default theme({
  shape:   { radius: { "2xs": "2px", xs: "5px", sm: "7px", md: "10px", lg: "14px", xl: "18px", "2xl": "22px", "3xl": "28px", key: "md", field: "md", card: "lg", pill: "full", disc: "full" },
             label: { case: "none", track: "0em" }, lift: "0 10px 30px", sunk: "inset 0 2px 4px" },
  size:    { row: 7.5, depth: "3px" },
  font:    { family: { sansHeading: plex.sans, sansText: plex.sans, serifHeading: plex.sans, serifText: plex.sans, brand: plex.sans, code: plex.mono } },
  text:    { header: "#0E1A25", strong: "#0E1A25", ink: "#374A5F", light: "#4B5D72", muted: "#5F7286" },
  control: { contrast: "#FFFFFF", contrastPressed: "#D2DBE7", on: "#374A5F", onMuted: "#5F7286", onPressed: "#3D528C", field: "#FFFFFF", selected: "rgba(14, 26, 37, 0.05)" },
  signal:  { primary:  { fill: "#3D528C", on: "#FFFFFF", tint: "rgba(61, 82, 140, 0.1)" },
             positive: { fill: "#3E7A3A", ink: "#2F6130", on: "#FFFFFF", tint: "rgba(62, 122, 58, 0.1)" },
             caution:  { fill: "#95661B", ink: "#704B10", on: "#FFFFFF", tint: "rgba(149, 102, 27, 0.1)" },
             negative: { fill: "#A4412A", ink: "#963A24", on: "#FFFFFF", tint: "rgba(164, 65, 42, 0.1)" } },
  zones: {
    0: { surface: "#0E1A25", surfaceSunk: "#060D14", surfaceLift: "#243544", boundary: "#040A10", boundaryStrong: "#384A5E", divider: "#243544", shadow: "rgba(0, 0, 0, 0.55)", inverse: "#EDF0F4", inverseOn: "#0E1A25",
         text:    { header: "#FFFFFF", strong: "#EDF0F4", ink: "#CBD3DD", light: "#AEBBCD", muted: "#8B97A3" },
         control: { contrast: "#EDF0F4", contrastHover: "#FFFFFF", contrastPressed: "#43505B", on: "#0E1A25", onMuted: "#5F7286", onPressed: "#EDF0F4",
                    field: "#060D14", fieldPlaceholder: "#8B97A3", selected: "rgba(255, 255, 255, 0.06)", divider: "rgba(0, 0, 0, 0.25)", scrollbar: "#384A5E" },
         signal:  { primary: { ink: "#AEBBD6" }, positive: { ink: "#9CCB98" }, caution: { ink: "#E2B86A" }, negative: { ink: "#E9A08C" } },
         brand:   { outline: "#AEBBD6" } },
    1: { surface: "#EDF0F4", surfaceSunk: "#DFE5EC", surfaceLift: "#FFFFFF", boundary: "#CBD3DD", boundaryStrong: "#AEBBCD", divider: "#D5DCE4", shadow: "rgba(14, 26, 37, 0.14)" },
    2: { surface: "#FFFFFF", surfaceSunk: "#EDF0F4", surfaceLift: "#FFFFFF", boundary: "#D5DCE4", boundaryStrong: "#AEBBCD", divider: "#E7EBF0", shadow: "rgba(14, 26, 37, 0.14)" },
    3: { surface: "#E2E7ED", surfaceSunk: "#D5DCE4", surfaceLift: "#FFFFFF", boundary: "#AEBBCD", boundaryStrong: "#5F7286", divider: "#CBD3DD", shadow: "rgba(14, 26, 37, 0.14)" },
  },
});
