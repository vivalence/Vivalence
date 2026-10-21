import { PassThrough } from "node:stream";
import { specimen } from "@vivalence/typology";
import { DEADLINE, display, leftover, measured, QUERY, UNMEASURED } from "../cell.js";

const terminal = (answer) => {
  const stdin = Object.assign(new PassThrough(), { isTTY: true, isRaw: false, modes: [] });
  stdin.setRawMode = (mode) => {
    stdin.modes.push(mode);
    stdin.isRaw = mode;
  };
  const written = [];
  const stdout = { write: (text) => (written.push(text), answer(stdin)) };
  return { stdin, stdout, written };
};

const drained = (stdin) => {
  const chunk = stdin.read();
  return chunk === null ? "" : chunk.toString("latin1");
};

specimen.describe("the cell-size query — asked once before the renderer owns stdin, answered or abandoned in 200 ms", { sanitizeOps: false, sanitizeResources: false }, () => {
  specimen.it("iTerm2 answers ReportCellSize height;width;scale in points — the display is that scale and the cell in device pixels; the query ends on the DA1 reply", async () => {
    const held = terminal((stdin) => stdin.write("\x1b]1337;ReportCellSize=19.0;7.0;2.0\x1b\\\x1b[4;890;940t\x1b[8;47;125t\x1b[?64;1;2;4;6;17;18;21;22;52c"));
    specimen.expect(await display(held.stdin, held.stdout)).toEqual({ scale: 2, cell: { width: 14, height: 38 } });
    specimen.expect(held.written).toEqual([QUERY]);
    specimen.expect(held.stdin.modes).toEqual([true, false]);
    specimen.expect(held.stdin.listenerCount("data")).toBe(0);
    specimen.expect(drained(held.stdin)).toBe("");
  });

  specimen.it("a terminal without ReportCellSize answers CSI 16t, 14t and 18t — the cell is the 16t cell, the scale that cell over the 14t area per column", () => {
    specimen.expect(measured("\x1b[6;38;14t\x1b[4;890;875t\x1b[8;47;125t\x1b[?62c")).toEqual({ scale: 2, cell: { width: 14, height: 38 } });
    specimen.expect(measured("\x1b[6;19;7t\x1b[4;890;875t\x1b[8;47;125t\x1b[?62c")).toEqual({ scale: 1, cell: { width: 7, height: 19 } });
    specimen.expect(measured("\x1b[4;890;875t\x1b[8;47;125t\x1b[?62c")).toEqual(UNMEASURED);
  });

  specimen.it("bytes that are not a reply — a key pressed during the query — go back onto stdin for the renderer, in order", async () => {
    const held = terminal((stdin) => stdin.write("q\x1b]1337;ReportCellSize=19.0;7.0;2.0\x07j\x1b[?62c"));
    specimen.expect((await display(held.stdin, held.stdout)).scale).toBe(2);
    specimen.expect(drained(held.stdin)).toBe("qj");
    specimen.expect(leftover("a\x1b[6;38;14tb\x1b[?1;2cc")).toBe("abc");
  });

  specimen.it("no DA1 by the deadline: the display is unmeasured, the listener is gone and stdin is paused — no read is left waiting for the reply", async () => {
    const held = terminal(() => undefined);
    const started = Date.now();
    specimen.expect(await display(held.stdin, held.stdout, 50)).toEqual(UNMEASURED);
    specimen.expect(Date.now() - started).toBeLessThan(DEADLINE);
    specimen.expect(held.stdin.listenerCount("data")).toBe(0);
    specimen.expect(held.stdin.isPaused()).toBe(true);
    specimen.expect(held.stdin.modes).toEqual([true, false]);
  });

  specimen.it("a pipe is no terminal: no query, the display is unmeasured", async () => {
    const held = terminal(() => undefined);
    held.stdin.isTTY = false;
    specimen.expect(await display(held.stdin, held.stdout)).toEqual(UNMEASURED);
    specimen.expect(held.written).toEqual([]);
  });
});
