import { KeySignal, specimen } from "@vivalence/typology";

const tty = (sequence, name, held = {}) => ({ sequence, name, ctrl: false, meta: false, shift: false, option: false, super: false, ...held });
const dom = (key, held = {}) => ({ key, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, ...held });

specimen.describe("KeySignal — a press spells its nature once: W3C ctrl alt shift meta in that order, a printable its character", () => {
  specimen.it("the tty arm reads opentui's ParsedKey: its meta is alt, its super is meta", () => {
    specimen.expect(new KeySignal(tty("S", "s", { shift: true })).nature).toBe("S");
    specimen.expect(new KeySignal(tty("?", "?")).nature).toBe("?");
    specimen.expect(new KeySignal(tty("\x1b[Z", "tab", { shift: true })).nature).toBe("shift-tab");
    specimen.expect(new KeySignal(tty("\x16", "v", { ctrl: true })).nature).toBe("ctrl-v");
    specimen.expect(new KeySignal(tty("\x1bs", "s", { meta: true })).nature).toBe("alt-s");
    specimen.expect(new KeySignal(tty("\x1b", "escape")).nature).toBe("esc");
    specimen.expect(new KeySignal(tty("s", "s", { ctrl: true, shift: true, super: true })).nature).toBe("ctrl-shift-meta-s");
  });

  specimen.it("the DOM arm reads a KeyboardEvent: alt is option, meta is command", () => {
    specimen.expect(new KeySignal(dom("?", { shiftKey: true })).nature).toBe("?");
    specimen.expect(new KeySignal(dom("s", { altKey: true })).nature).toBe("alt-s");
    specimen.expect(new KeySignal(dom("s", { metaKey: true })).nature).toBe("meta-s");
    specimen.expect(new KeySignal(dom("Escape")).nature).toBe("esc");
    specimen.expect(new KeySignal(dom("ArrowUp")).nature).toBe("up");
    specimen.expect(new KeySignal(dom(" ")).nature).toBe("space");
  });

  specimen.it("a string is its nature; an array of strings is a held sequence", () => {
    specimen.expect(new KeySignal("leader").nature).toBe("leader");
    specimen.expect(new KeySignal(["leader", "d", "d"]).array.map((signal) => signal.nature)).toEqual(["leader", "d", "d"]);
  });
});
