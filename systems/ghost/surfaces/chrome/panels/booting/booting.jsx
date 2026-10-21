import * as widgets from "../../widgets/index.js";

export function Booting(props) {
  return <widgets.swatch.Swatch name="booting" fill={props.palette.inverse} ink={props.palette.inverseOn} style={{ width: "100%", height: "100%" }} />;
}
