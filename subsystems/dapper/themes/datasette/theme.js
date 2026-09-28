import { theme } from "../../lib/theme.js";

const mono = "Space Mono, monospace";
const display = "VT323, Space Mono, monospace";

export default theme({
  shape:   { radius: "0px", label: { case: "uppercase", track: ".08em" }, lift: "6px 6px 0", sunk: "0 0 0 0" },
  size:    { row: 6.5, depth: "0px" },
  font:    { family: { sansHeading: display, sansText: mono, serifHeading: display, serifText: mono, brand: display, code: mono } },
  text:    { header: "#111111", strong: "#111111", ink: "#333333", light: "#5E5E57", muted: "#5E5E57" },
  control: { contrast: "#FFFFFF", contrastPressed: "#1A1A1A", on: "#333333", onMuted: "#5E5E57", onPressed: "#F4F4F1", field: "#FFFFFF", selected: "rgba(0, 0, 0, 0.05)", focus: "#C8401A", divider: "#2A2A2A" },
  signal:  { primary:  { fill: "#C8401A", ink: "#A63216", on: "#FFFFFF", tint: "rgba(200, 64, 26, 0.14)" },
             positive: { fill: "#2F7A3A", ink: "#286830", on: "#FFFFFF", tint: "rgba(47, 122, 58, 0.14)" },
             caution:  { fill: "#9A6A10", ink: "#725006", on: "#FFFFFF", tint: "rgba(154, 106, 16, 0.14)" },
             negative: { fill: "#C8401A", ink: "#A63216", on: "#FFFFFF", tint: "rgba(200, 64, 26, 0.14)" } },
  brand:   { filter: "drop-shadow(2px 2px 0 #000000)" },
  zones: {
    0: { surface: "#111111", surfaceSunk: "#000000", surfaceLift: "#2A2A2A", boundary: "#000000", boundaryStrong: "#5E5E57", divider: "#2A2A2A", shadow: "#000000", inverse: "#F4F4F1", inverseOn: "#111111",
         text:    { header: "#FFFFFF", strong: "#F4F4F1", ink: "#D9D9D4", light: "#A8A8A2", muted: "#8A8A84" },
         control: { contrast: "#F4F4F1", contrastHover: "#FFFFFF", contrastPressed: "#464646", on: "#111111", onMuted: "#8A8A84", onPressed: "#F4F4F1",
                    field: "#000000", fieldPlaceholder: "#8A8A84", selected: "rgba(255, 255, 255, 0.06)", focus: "#F0A18B", divider: "#000000", scrollbar: "#5E5E57" },
         signal:  { primary: { ink: "#F0A18B" }, positive: { ink: "#8FCF98" }, caution: { ink: "#E3B85A" }, negative: { ink: "#F0A18B" } } },
    1: { surface: "#F4F4F1", surfaceSunk: "#E7E7E2", surfaceLift: "#FFFFFF", boundary: "#2A2A2A", boundaryStrong: "#111111", divider: "#2A2A2A", shadow: "#111111" },
    2: { surface: "#FFFFFF", surfaceSunk: "#EEEEEA", surfaceLift: "#FFFFFF", boundary: "#2A2A2A", boundaryStrong: "#111111", divider: "#2A2A2A", shadow: "#111111" },
    3: { surface: "#EEEEEA", surfaceSunk: "#E7E7E2", surfaceLift: "#FFFFFF", boundary: "#2A2A2A", boundaryStrong: "#111111", divider: "#2A2A2A", shadow: "#111111" },
  },
});
