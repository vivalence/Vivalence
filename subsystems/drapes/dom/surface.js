import { atom } from "nanostores";
import { fn, Pipe, Vector } from "@vivalence/typology";
import { accept } from "./accept.js";
import { assemble } from "./chassis.jsx";
import { keydowns } from "./keys.js";
import * as panes from "./panes/index.js";
import { adopt } from "./sheet.js";

export const dom = (root, { credentials, theme = "northsea" }) => {
  root.ownerDocument.documentElement.setAttribute("data-theme", theme);
  root.setAttribute("data-zone", "1");

  const chassis = fn.memo(
    (dispatch) => {
      adopt(root.ownerDocument);
      return assemble(root, dispatch);
    },
    () => root,
  );
  const $output = atom(null);
  const pane = (name, Pane) => (client) => chassis(client.dispatch).mount(name, Pane, { client, dispatch: client.dispatch, $output });

  return {
    name: "dom",
    root,
    viewport: () => ({ width: root.clientWidth, height: root.clientHeight }),
    credentials,
    trajectory: new Vector(),
    accept,
    keys: new Pipe().from(keydowns(root)),
    emit: (kind, props) => $output.set({ kind, props }),
    mount: {
      signin: pane("signin", panes.Signin),
      crown: pane("crown", panes.Crown),
      dock: pane("dock", panes.Dock),
      frame: pane("frame", panes.Frame),
      navigation: pane("navigation", panes.Navigation),
    },
  };
};
