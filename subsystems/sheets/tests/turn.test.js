import { specimen } from "@vivalence/typology";
import { frame, palette, parts } from "./scenarios/index.js";

specimen.describe("Turn — one journal entry by register", () => {
  specimen.it("you and agent are headed: register · who · meta, the body below", async () => {
    const { Turn } = await parts;
    const lines = (await frame(() => Turn({ palette: palette(), register: "you", who: "beef", meta: "09:14", text: "play e4" }), { width: 30, height: 2 })).split("\n");
    specimen.expect(lines[0]).toMatch(/^<< beef 09:14/);
    specimen.expect(lines[1]).toMatch(/^ play e4/);
  });

  specimen.it("an agent's body is markdown; its calls follow, each with its status glyph", async () => {
    const { Turn } = await parts;
    const lines = (await frame(() => Turn({ palette: palette(), register: "agent", meta: "0.7s", text: "# centre\n- e4", calls: [{ name: "match_board", arg: "{}", status: "ok", duration: "0.4s" }, { name: "match_move", status: "wait" }, { name: "repl_whoami", status: "ok", loop: true }] }), { width: 40, height: 6 })).split("\n");
    specimen.expect(lines[0]).toMatch(/^>> 0.7s/);
    specimen.expect(lines[1]).toMatch(/^ centre/);
    specimen.expect(lines[2]).toMatch(/^ • e4/);
    specimen.expect(lines[3]).toMatch(/^ ✓ match_board \{\} 0.4s/);
    specimen.expect(lines[4]).toMatch(/^ \? match_move waiting/);
    specimen.expect(lines[5]).toMatch(/^ ✓ loop repl_whoami/);
  });

  specimen.it("cmd · msg · fault · trace are one row: the register, then the text; a cmd's answer indents under it", async () => {
    const { Turn } = await parts;
    specimen.expect(await frame(() => Turn({ palette: palette(), register: "fault", text: "provider timeout · r3" }), { width: 30, height: 1 })).toMatch(/^! provider timeout · r3/);
    const lines = (await frame(() => Turn({ palette: palette(), register: "cmd", text: "/tune fast", answer: "tune fast" }), { width: 30, height: 2 })).split("\n");
    specimen.expect(lines[0]).toMatch(/^<< \/tune fast/);
    specimen.expect(lines[1]).toMatch(/^   tune fast/);
  });

  specimen.it("a register or a call status outside the table throws", async () => {
    const { register, call } = await parts;
    specimen.expect(() => register("system")).toThrow(/not a register: "system" · you · agent · cmd · msg · fault · trace/);
    specimen.expect(() => call("done")).toThrow(/not a call status: "done" · run · ok · wait · skip · err/);
  });
});
