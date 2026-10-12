import { specimen } from "@vivalence/typology";
import { read } from "../gestalten/belt/line.js";
import { execution } from "../lifecycle/repl.js";

const TEXT = (line) => [{ type: "text", text: line }];

specimen.describe("line.read — a sigil line is strict; a bare line is the verb its words name when that verb takes every word left, else a turn", () => {
  const rows = [
    ["a verb word", "quit", "/quit", []],
    ["the shell's name in front", "viva quit", "/quit", []],
    ["a verb and the param it takes", "dock share 0.5", "/dock/share", ["0.5"]],
    ["words for the slashes", "thread new /daemon/memo/mode/srs/memo", "/thread/new", ["/daemon/memo/mode/srs/memo"]],
    ["a slashed path without the sigil", "thread/new /daemon/memo/mode/srs/memo", "/thread/new", ["/daemon/memo/mode/srs/memo"]],
    ["a verb with a flag", "quit --json", "/quit", []],
    ["a listing", "modes", "/modes", []],
    ["a deeper literal and its param", "dock side left", "/dock/side", ["left"]],
    ["a key chord by name", "key esc", "/key/esc", []],
    ["a sigil line as typed", "/terminal/new", "/terminal/new", []],
    ["a sigil line nothing knows stays strict", "/typo", "/typo", []],
  ];

  for (const [name, line, pathname, body] of rows) {
    specimen.it(`${name}: ${line}`, () => {
      const signal = read(execution, line);
      specimen.expect([signal.pathname, signal.body]).toEqual([pathname, body]);
    });
  }

  const turns = [
    ["chat", "ciao come stai"],
    ["chat carrying stub flags", "salve --tool session"],
    ["a shell verb the repl lacks", "client repl"],
    ["a sentence that opens with a verb taking no words", "quit smoking is hard"],
    ["a sentence that opens with a verb taking fewer words", "help me with deus"],
    ["an id slot never takes a loose word", "terminal velocity is cool"],
    ["a noun with no verb of its own below it", "dock"],
    ["the shell's name alone", "viva"],
  ];

  for (const [name, line] of turns) {
    specimen.it(`${name} is a turn: ${line}`, () => {
      const signal = read(execution, line);
      specimen.expect([signal.pathname, signal.body]).toEqual(["/*", TEXT(line)]);
    });
  }

  specimen.it("a key arrives as its /key line", () => {
    specimen.expect(read(execution, "/key/ctrl-f").pathname).toBe("/key/ctrl-f");
  });
});
