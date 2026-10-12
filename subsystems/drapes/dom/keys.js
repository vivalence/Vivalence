import { Queue } from "@vivalence/typology";

const NAMES = {
  Escape: "esc",
  Enter: "enter",
  Tab: "tab",
  " ": "space",
  Backspace: "backspace",
  Delete: "delete",
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  PageUp: "pageup",
  PageDown: "pagedown",
  Home: "home",
  End: "end",
};

const MODIFIERS = [
  ["ctrlKey", "ctrl"],
  ["altKey", "alt"],
  ["metaKey", "meta"],
  ["shiftKey", "shift"],
];

const BARE = new Set(["Control", "Alt", "Meta", "Shift", "CapsLock", "Dead", "Unidentified", "Process"]);

const typed = (event) => event.key.length === 1 && !(event.key in NAMES) && !event.ctrlKey && !event.altKey && !event.metaKey;

const EDITABLE = new Set(["INPUT", "TEXTAREA", "SELECT"]);

const editable = (target) => target !== null && (EDITABLE.has(target.tagName) || target.isContentEditable === true);

const owned = (event) => editable(event.target) && !event.ctrlKey && !event.altKey && !event.metaKey && event.key !== "Escape";

export const chord = (event) => {
  if (BARE.has(event.key)) return null;
  if (typed(event)) return event.key;
  const name = event.key in NAMES ? NAMES[event.key] : event.key.toLowerCase();
  return [...MODIFIERS.filter(([flag]) => event[flag]).map(([, modifier]) => modifier), name].join("-");
};

export const keydowns = (root) => {
  const queue = new Queue();
  root.addEventListener("keydown", (event) => {
    if (event.isComposing || owned(event)) return;
    const key = chord(event);
    if (key !== null) queue.enqueue({ key });
  });
  return queue;
};
