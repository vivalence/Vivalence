import { specimen } from "@vivalence/typology";
import { fire, paint, settle, surface, world } from "./world.js";
import { oracle, shape } from "../../../subsystems/drapes/tests/parts/oracle.js";

const seated = async () => {
  const held = world();
  held.seat();
  held.authorize();
  held.activate();
  const rig = paint(() => surface.Composer({ client: held.client, terminal: held.terminal }));
  await settle();
  return { ...held, rig };
};

const CHEV2 = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3.5 3.5 8 8 12.5M12.5 3.5 8 8l4.5 4.5"/></svg>`;
const UP = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5"/></svg>`;
const STOP = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="8" height="8" rx="1"/></svg>`;

const IDLE = `<div class="field focus  "><span class="pcw"><button class="pc  " data-fn="ctlmenu" aria-label="control" aria-haspopup="menu" aria-expanded="false" title="control · upload · dictate">${CHEV2}</button></span><textarea id="composer" class="" rows="1" spellcheck="false" placeholder="say it, or / for a command" aria-label="composer"></textarea><span class="fk"><button class="send" data-fn="send" aria-label="send" title="send · enter">${UP}</button></span></div>`;

const RUNNING = `<div class="field focus  "><span class="pcw"><button class="pc  " data-fn="ctlmenu" aria-label="control" aria-haspopup="menu" aria-expanded="false" title="control · upload · dictate">${CHEV2}</button></span><textarea id="composer" class="" rows="1" spellcheck="false" placeholder="say it, or / for a command" aria-label="composer"></textarea><span class="fk"><button class="stop" data-line="/stop" aria-label="stop" title="stop · esc · /stop">${STOP}</button></span></div>`;

const MENU = `<span class="ctlmenu" role="menu"><button role="menuitem" data-fn="upload"><svg><path/></svg><span>upload</span><i>ctrl-v c a</i></button><button role="menuitem" class="" data-fn="dictmenu"><svg><rect></rect><path></path></svg><span>dictate</span><i>ctrl-v c d</i></button></span>`;

const CONSENT = `<div class="consent" role="group" aria-label="consent"><span class="q">?</span><span>approve</span><span class="call">hallucination #activity</span><span class="keys"><button data-line="/approve"><b>y</b>approve</button><button data-line="/skip"><b>n</b>skip</button><button data-line="/edit"><b>e</b>edit</button></span></div>`;

specimen.describe("anima composer — the design's composer (dom.js:280): consent, or atts · field with .pcw · textarea · .fk", () => {
  specimen.it("idle: the field with the control, the textarea, the send key", async () => {
    const { rig } = await seated();
    specimen.expect(shape(rig.target)).toBe(oracle(IDLE));
    rig.close();
  });

  specimen.it("a draft opening with / wears .repl; Enter and the send key dispatch the line and clear it; the draft IS client.surface.$draft", async () => {
    const { rig, sent, client } = await seated();
    const field = rig.target.querySelector("textarea");
    field.value = "/modes";
    fire(field, "input");
    await settle();
    specimen.expect([rig.target.querySelector(".field").classList.contains("repl"), field.classList.contains("repl"), rig.target.querySelector(".pc").classList.contains("repl")]).toEqual([true, true, true]);
    specimen.expect(client.surface.draft).toBe("/modes");
    fire(field, "keydown", { key: "Enter", shiftKey: false });
    specimen.expect(client.surface.draft).toBe("");
    field.value = "ciao";
    fire(field, "input");
    fire(rig.target.querySelector(".send"), "click");
    await settle();
    specimen.expect(sent).toEqual(["/modes", "ciao"]);
    specimen.expect(rig.target.querySelector(".field").classList.contains("repl")).toBe(false);
    client.surface.$draft.set("/dock closed");
    await settle();
    specimen.expect(rig.target.querySelector("textarea").value).toBe("/dock closed");
    rig.close();
  });

  specimen.it("focus on the textarea is the composer's focus; the field wears .focus; journal focus drops it", async () => {
    const { rig, client } = await seated();
    client.surface.$focus.set("journal");
    await settle();
    specimen.expect(rig.target.querySelector(".field").classList.contains("focus")).toBe(false);
    fire(rig.target.querySelector("textarea"), "focus");
    await settle();
    specimen.expect(client.surface.focus).toBe("composer");
    specimen.expect(rig.target.querySelector(".field").classList.contains("focus")).toBe(true);
    rig.close();
  });

  specimen.it("a RUNNING activity on the thread trades send for stop, which is /stop", async () => {
    const { rig, entities, thread, sent } = await seated();
    entities.activity.$entities.set([{ id: "activity-1", type: "HALLUCINATION", status: "RUNNING", steps: [], thread }]);
    await settle();
    specimen.expect(shape(rig.target)).toBe(oracle(RUNNING));
    fire(rig.target.querySelector(".stop"), "click");
    specimen.expect(sent).toEqual(["/stop"]);
    rig.close();
  });

  specimen.it("the control opens the menu; dictate is the /dictate line", async () => {
    const { rig, sent } = await seated();
    fire(rig.target.querySelector(".pc"), "click");
    await settle();
    specimen.expect(shape(rig.target.querySelector(".pcw")).split("\n").length).toBe(2);
    specimen.expect(shape(rig.target.querySelector(".pcw")).split("\n")[1]).toBe(oracle(MENU));
    fire(rig.target.querySelectorAll(".ctlmenu button")[1], "click");
    specimen.expect(sent).toEqual(["/dictate"]);
    rig.close();
  });

  specimen.it("a PAUSED activity puts the design's .consent where the field was; its keys are lines", async () => {
    const { rig, entities, thread, sent } = await seated();
    entities.activity.$entities.set([{ id: "activity-1-abcdef", type: "HALLUCINATION", status: "PAUSED", steps: [], thread }]);
    await settle();
    specimen.expect(shape(rig.target)).toBe(oracle(CONSENT));
    for (const button of rig.target.querySelectorAll(".consent button")) fire(button, "click");
    specimen.expect(sent).toEqual(["/resume", "/stop", "/abort"]);
    rig.close();
  });
});
