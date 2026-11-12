import * as ambient from "./ambient.shim.js";
import { Textarea } from "./textarea.target.jsx";
export { render } from "solid-js/web";
export const Mounted = (props) => (
  <ambient.app.Provider value={props.app}>
    <ambient.terminal.Provider value={props.terminal}>
      <Textarea />
    </ambient.terminal.Provider>
  </ambient.app.Provider>
);
