import * as is from "../gestalten/is/index.js";
import { Signature } from "./signature.js";

const MODIFIERS = ["ctrl", "alt", "shift", "meta"];

const NAMES = { escape: "esc", return: "enter", linefeed: "enter", arrowleft: "left", arrowright: "right", arrowup: "up", arrowdown: "down", " ": "space" };

const PRINTABLE = /^[^\p{C}\s]+$/u;

const spell = (down, character, name) => {
  const held = MODIFIERS.filter((modifier) => down[modifier]);

  if (!down.ctrl && !down.alt && !down.meta && PRINTABLE.test(character)) return [{ nature: character }];

  const named = Object.hasOwn(NAMES, name) ? NAMES[name] : name;
  return [{ nature: [...held, named].join("-") }];
};

export class KeySignal extends Signature {
  static coercions = [
    [
      (event) => is.object(event) && is.string(event.sequence),
      (event) => spell({ ctrl: event.ctrl, alt: event.meta || event.option, shift: event.shift, meta: event.super === true }, event.sequence, event.name),
    ],
    [
      (event) => is.object(event) && is.string(event.key),
      (event) => spell({ ctrl: event.ctrlKey, alt: event.altKey, shift: event.shiftKey, meta: event.metaKey }, [...event.key].length === 1 ? event.key : "", event.key.toLowerCase()),
    ],
    [(key) => is.string(key), (key) => [{ nature: key }]],
  ];
}
