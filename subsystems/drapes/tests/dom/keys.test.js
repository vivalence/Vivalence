import { specimen } from "@vivalence/typology";
import { chord, keydowns } from "../../dom/keys.js";
import { document, fire, fresh, settle, surface } from "./rig.js";

const press = (key, modifiers = {}) => ({ key, ctrlKey: false, altKey: false, metaKey: false, shiftKey: false, ...modifiers });

const drain = async (queue, count) => {
  const held = [];
  for await (const value of queue.drain()) {
    held.push(value);
    if (held.length === count) return held;
  }
  return held;
};

specimen.describe("dom keys — a keydown spelled as the terminal spells a chord", () => {
  const TABLE = [
    [press("t", { ctrlKey: true }), "ctrl-t"],
    [press("Escape"), "esc"],
    [press("Enter"), "enter"],
    [press("Enter", { shiftKey: true }), "shift-enter"],
    [press("f"), "f"],
    [press("F", { shiftKey: true }), "F"],
    [press("?", { shiftKey: true }), "?"],
    [press("T", { ctrlKey: true, shiftKey: true }), "ctrl-shift-t"],
    [press("k", { metaKey: true }), "meta-k"],
    [press("x", { altKey: true }), "alt-x"],
    [press("ArrowUp"), "up"],
    [press(" "), "space"],
    [press("Tab", { shiftKey: true }), "shift-tab"],
    [press("Shift", { shiftKey: true }), null],
    [press("Control", { ctrlKey: true }), null],
  ];
  for (const [event, spelled] of TABLE) {
    specimen.it(`${JSON.stringify(event.key)} ${Object.keys(event).filter((flag) => event[flag] === true).join("+")} → ${spelled}`, () => {
      specimen.expect(chord(event)).toBe(spelled);
    });
  }

  specimen.it("keydowns queues { key } chords from the root", async () => {
    const { root } = fresh();
    const queue = keydowns(root);
    fire(root, "keydown", press("t", { ctrlKey: true }));
    fire(root, "keydown", press("Escape"));
    fire(root, "keydown", press("Shift", { shiftKey: true }));
    fire(root, "keydown", press("f"));
    specimen.expect(await drain(queue, 3)).toEqual([{ key: "ctrl-t" }, { key: "esc" }, { key: "f" }]);
  });

  specimen.it("a field keeps its own typing: printable keys and enter stay in it, chords and esc pass", async () => {
    const { root } = fresh();
    const field = document.createElement("textarea");
    root.append(field);
    const queue = keydowns(root);
    fire(field, "keydown", press("a"));
    fire(field, "keydown", press("Enter"));
    fire(field, "keydown", press("t", { ctrlKey: true }));
    fire(field, "keydown", press("Escape"));
    specimen.expect(await drain(queue, 2)).toEqual([{ key: "ctrl-t" }, { key: "esc" }]);
  });

  specimen.it("the surface's keys Pipe carries the same chords", async () => {
    const module = await surface;
    const { root } = fresh();
    const bag = module.dom(root, { credentials: null });
    const held = [];
    bag.keys.tap((value) => held.push(value));
    fire(root, "keydown", press("o", { ctrlKey: true }));
    fire(root, "keydown", press("Enter"));
    await settle();
    specimen.expect(held).toEqual([{ key: "ctrl-o" }, { key: "enter" }]);
  });
});
