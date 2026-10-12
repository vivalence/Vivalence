import { style as button } from "./Button.jsx";
import { style as chassis } from "./chassis.jsx";
import { style as empty } from "./Empty.jsx";
import { style as field } from "./Field.jsx";
import { style as jsonTree } from "./JsonTree.jsx";
import { style as logo } from "./Logo.jsx";
import { style as markdown } from "./Markdown.jsx";
import { style as pip } from "./Pip.jsx";
import { style as row } from "./Row.jsx";
import { style as spinner } from "./Spinner.jsx";
import { style as strip } from "./Strip.jsx";
import { style as crown } from "./panes/crown.jsx";
import { style as dock } from "./panes/dock.jsx";
import { style as frame } from "./panes/frame.jsx";
import { style as navigation } from "./panes/navigation.jsx";
import { style as signin } from "./panes/signin.jsx";

const KIT = [button, empty, field, jsonTree, logo, markdown, pip, row, spinner, strip];
const PANES = [crown, dock, frame, navigation, signin];

export const sheet = [chassis, ...KIT, ...PANES].join("");

export const adopt = (document) => {
  if (document.head.querySelector("style[data-drapes-dom]") !== null) return;
  const element = document.createElement("style");
  element.setAttribute("data-drapes-dom", "");
  element.textContent = sheet;
  document.head.append(element);
};
