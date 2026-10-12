import { specimen } from "@vivalence/typology";
import { ReplSignal } from "../prototypes/replsignal.js";

specimen.describe("ReplSignal — a bare line, a sigil line, an argv", () => {
  const rows = [
    ["a bare line is a yap at *", "ciao", ["*"], [{ type: "text", text: "ciao" }], {}],
    ["a sigil line is its path", "/terminal/new", ["terminal", "new"], [], {}],
    ["a sigil line carries its body and flags", "/dock/side left --json", ["dock", "side"], ["left"], { json: true }],
    ["an argv is its path with body and flags", ["instance/use", "italian", "--ledger"], ["instance", "use"], ["italian"], { ledger: true }],
    ["a key is a chord under /key", "/key/ctrl-f", ["key", "ctrl-f"], [], {}],
    ["--help is a flag on the nature it names", "/dock --help", ["dock"], [], { help: true }],
  ];

  for (const [name, input, natures, body, flags] of rows) {
    specimen.it(name, () => {
      const signal = new ReplSignal(input);
      specimen.expect({ natures: signal.absolute, body: signal.body, flags: signal.flags }).toEqual({ natures, body, flags });
    });
  }

  specimen.it("a bare line keeps its whole text as one part, never tokenized", () => {
    const signal = new ReplSignal("ciao come stai");
    specimen.expect(signal.pathname).toBe("/*");
    specimen.expect(signal.body).toEqual([{ type: "text", text: "ciao come stai" }]);
  });

  specimen.it("a quoted sigil line keeps its words together as one element", () => {
    const signal = new ReplSignal('/thread/new "my words"');
    specimen.expect([signal.pathname, signal.body]).toEqual(["/thread/new", ["my words"]]);
  });
});
