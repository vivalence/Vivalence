import { from } from "solid-js";
import * as ambient from "../../ambient/index.js";
import * as widgets from "../../widgets/index.js";

export function Telemetry(props) {
  const telemetry = from(ambient.app.consume().telemetry.$state);
  return (
    <widgets.swatch.Swatch
      name="telemetry"
      fill={props.palette.signalPrimaryInk}
      ink={props.palette.inverseOn}
      style={{ position: "absolute", left: telemetry().window.x, top: telemetry().window.y, width: telemetry().window.width, height: telemetry().window.height, zIndex: 10 }}
    />
  );
}
