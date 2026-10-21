import * as widgets from "../../widgets/index.js";

export function Signin(props) {
  return <widgets.swatch.Swatch name="signin" fill={props.palette.textMuted} ink={props.palette.inverseOn} style={{ width: "100%", height: "100%" }} />;
}
