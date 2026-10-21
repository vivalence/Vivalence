import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";
import { oracle, shape } from "./oracle.js";

const FIELD = `<div class="field   "><span class="pcw"></span><textarea id="composer" class="" rows="1" spellcheck="false" placeholder="say it, or / for a command" aria-label="composer"></textarea><span class="fk"></span></div>`;

const REPL = `<div class="field focus dict repl"><span class="pcw"></span><textarea class="repl" rows="1" spellcheck="false" placeholder="" aria-label="composer"></textarea><span class="fk"></span></div>`;

specimen.describe("Field — the design's .field (dom.js:288): .pcw · textarea · .fk", () => {
  specimen.it("the composer: id composer, the placeholder, empty lead and keys", () => {
    const rig = screen(() => parts.Field({ id: "composer", placeholder: "say it, or / for a command" }));
    specimen.expect(shape(rig.target)).toBe(oracle(FIELD));
    rig.close();
  });

  specimen.it("a draft opening with / wears .repl on the field and the textarea; focus and dictating are classes", () => {
    const rig = screen(() => parts.Field({ value: "/modes", focus: true, dictating: true }));
    specimen.expect(shape(rig.target)).toBe(oracle(REPL));
    specimen.expect(rig.target.querySelector("textarea").value).toBe("/modes");
    rig.close();
  });

  specimen.it("a filter names itself filter", () => {
    const rig = screen(() => parts.Field({ kind: "filter" }));
    specimen.expect(rig.target.querySelector("textarea").getAttribute("aria-label")).toBe("filter");
    rig.close();
  });

  specimen.it("input reports the text; Enter submits it; shift-Enter does not", () => {
    const typed = [];
    const sent = [];
    const rig = screen(() => parts.Field({ onInput: (text) => typed.push(text), onSubmit: (text) => sent.push(text) }));
    const input = rig.target.querySelector("textarea");
    input.value = "play e4";
    fire(input, "input");
    fire(input, "keydown", { key: "Enter", shiftKey: true });
    fire(input, "keydown", { key: "Enter" });
    specimen.expect(typed).toEqual(["play e4"]);
    specimen.expect(sent).toEqual(["play e4"]);
    rig.close();
  });
});
