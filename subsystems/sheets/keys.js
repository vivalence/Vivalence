import { Queue } from "@vivalence/typology";

const NAMES = { escape: "esc", return: "enter", linefeed: "enter" };

const named = (event) => (Object.hasOwn(NAMES, event.name) ? NAMES[event.name] : event.name);

const PRINTABLE = /^[^\p{C}\s]+$/u;

const CHORDS = [
  [(event) => event.ctrl, (event) => `ctrl-${named(event)}`],
  [(event) => event.meta, (event) => `meta-${named(event)}`],
  [(event) => PRINTABLE.test(event.sequence), (event) => event.sequence],
  [() => true, named],
];

export const press = (event) => ({ key: CHORDS.find(([test]) => test(event))[1](event) });

export const keypresses = (renderer) => {
  const queue = new Queue();
  const listener = (event) => queue.enqueue(press(event));
  renderer.keyInput.on("keypress", listener);
  renderer.once("destroy", () => {
    renderer.keyInput.off("keypress", listener);
    queue.close();
  });
  return queue;
};
