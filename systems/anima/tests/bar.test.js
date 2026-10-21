import { specimen, Vector } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";
import { fire, paint, settle, surface, world } from "./world.js";
import { oracle, shaped } from "../../../subsystems/drapes/tests/scenarios/shape.js";

const DESIGN = `<button class="mark open" data-fn="mark" aria-label="vivalence" title="once: keys · twice: repl · hold: sidebar"><span class="viket" style="width:20px;height:20px" aria-hidden="true"></span></button>
<button class="seg ent " data-fn="wid" data-arg="entity" aria-haspopup="dialog" aria-expanded="false" title="entity · ctrl-v e"><span class="lab">[first words</span><span class="q">‹chat/chat›]</span></button>
<span class="seg sp"></span>
<button class="seg har " data-fn="wid" data-arg="harness" aria-haspopup="dialog" aria-expanded="false" title="harness · ctrl-v h"><span class="q"><svg></svg></span><span>fast</span><span class="q">·</span><span class="v">low</span><span class="meter " title="context 0 %"><i class=""></i><i class=""></i><i class=""></i><i class=""></i><i class=""></i><i class=""></i></span><span class="q"><svg></svg></span></button>
<button class="seg proc idle " data-fn="wid" data-arg="activity" aria-haspopup="dialog" aria-expanded="false" title="activity · ctrl-v a"><span class="dot" style="opacity:.35"></span><span class="lab">idle</span></button>
<button class="seg disp " data-fn="wid" data-arg="display" data-hold="pop" aria-haspopup="dialog" aria-expanded="false" title="display · ctrl-v d"><svg class="dispg"></svg><span class="q">repl</span></button>
<button class="seg box " data-fn="wid" data-arg="box" aria-haspopup="dialog" aria-expanded="false" title="box · ctrl-v x"><span class="light"><svg></svg></span></button>
<button class="seg sys " data-fn="wid" data-arg="system" aria-haspopup="dialog" aria-expanded="false" title="system · ctrl-v s"><span class="light"><svg></svg></span><span class="dot pos"></span></button>`;

const KEYS = `<div class="ph"><span class="tag">ctrl-v</span><span class="crumb">once = keys · twice = the palette</span><span class="hint">esc drops</span></div><div class="keys kcols"><button class=""><b>d</b><span class="kl">display</span><i>how do I see it</i></button><button class=""><b>h</b><span class="kl">harness</span><i>what is it given</i></button><button class=""><b>e</b><span class="kl">entity</span><i>where am I</i></button><button class=""><b>a</b><span class="kl">activity</span><i>is it working</i></button><button class=""><b>s</b><span class="kl">system</span><i>what does it run on</i></button><button data-fn="press" data-arg="leader"><b>ctrl-v</b><span class="kl">palette</span><i></i></button></div>`;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const seated = async () => {
  const held = world();
  held.seat();
  held.authorize();
  held.activate();
  held.entities.mode.$entities.get()[0].repl = new Vector();
  held.entities.mode.$entities.get()[0].daemon = null;
  held.terminal.repl.commands = new Vector().graft(ghost.terminal.commands.dock, ghost.terminal.commands.intelligent);
  const rig = paint(() => [surface.Bar({ client: held.client }), surface.Panel({ client: held.client }), surface.Wid({ client: held.client }), surface.Pop({ client: held.client })]);
  await settle();
  const close = () => rig.close();
  return { ...held, rig, close };
};

specimen.describe("bar — Dom.bar: the mark and six segments; a segment opens its .wid; the mark is keys · repl · sidebar", () => {
  specimen.it("the class tree is the design's", async () => {
    const { rig, client, close } = await seated();
    client.surface.$sidebar.set(true);
    await settle();
    const nav = rig.target.querySelector("nav.modebar[data-zone='0'][aria-label='mode bar']");
    specimen.expect(shaped(nav)).toBe(oracle(DESIGN));
    specimen.expect([...nav.querySelectorAll(".seg[data-arg]")].map((segment) => segment.getAttribute("title"))).toEqual(["entity · ctrl-v e", "harness · ctrl-v h", "activity · ctrl-v a", "display · ctrl-v d", "box · ctrl-v x", "system · ctrl-v s"]);
    await close();
  });

  specimen.it("a running activity: .seg.proc.pri with a .dot.pri.live; a FAILED one puts .fault on the mark", async () => {
    const { rig, entities, thread, close } = await seated();
    entities.activity.$entities.set([{ id: "activity-1", type: "HALLUCINATION", status: "RUNNING", steps: [{ path: "/tools/lookup" }], thread }]);
    await settle();
    specimen.expect(shaped(rig.target.querySelector(".seg[data-arg='activity']"))).toBe(`span.dot.live.pri span.lab("lookup · running")`);
    specimen.expect(rig.target.querySelector(".seg[data-arg='activity']").className).toBe("seg proc pri");
    specimen.expect(rig.target.querySelector(".mark .viket").className).toBe("viket live");
    entities.activity.$entities.set([{ id: "activity-1", type: "HALLUCINATION", status: "FAILED", steps: [], thread }]);
    await settle();
    specimen.expect(rig.target.querySelector(".seg[data-arg='activity']").className).toBe("seg proc neg");
    specimen.expect(rig.target.querySelector(".mark .fault")).not.toBe(null);
    await close();
  });

  specimen.it("a segment click opens its section in .wid over a .scrim; a second click or the scrim closes it", async () => {
    const { rig, client, sent, close } = await seated();
    const harness = rig.target.querySelector(".seg[data-arg='harness']");
    fire(harness, "click");
    await settle();
    specimen.expect(client.surface.wid.id).toBe("harness");
    specimen.expect(harness.classList.contains("open")).toBe(true);
    specimen.expect(harness.getAttribute("aria-expanded")).toBe("true");
    const wid = rig.target.querySelector(".wid[data-zone='0'][role='dialog'][aria-label='harness']");
    specimen.expect(rig.target.querySelector(".scrim")).not.toBe(null);
    specimen.expect(shaped(wid).startsWith(`div.subj(div.subjh(span.t("harness")) div.subjb(div.choice.srow(span.cl("tune")`)).toBe(true);
    specimen.expect(wid.getAttribute("style")).toBe(`left:8px;bottom:${client.surface.height + 6}px;width:320px;max-height:180px`);
    fire(wid.querySelector("[data-line='/effort high']"), "click");
    specimen.expect(sent).toEqual(["/effort high"]);
    fire(rig.target.querySelector(".scrim"), "click");
    await settle();
    specimen.expect(rig.target.querySelector(".wid")).toBe(null);
    fire(harness, "click");
    fire(harness, "click");
    await settle();
    specimen.expect(client.surface.wid).toBe(null);
    await close();
  });

  specimen.it("holding the display segment opens the .pop dset at the pointer; its lines dispatch", async () => {
    const { rig, client, sent, close } = await seated();
    const display = rig.target.querySelector(".seg[data-arg='display']");
    fire(display, "pointerdown", { clientX: 900, clientY: 780 });
    await wait(450);
    specimen.expect(client.surface.pop).toEqual({ x: 900, y: 780 });
    const pop = rig.target.querySelector(".pop[data-zone='0'][role='dialog'][aria-label='display']");
    specimen.expect(pop.getAttribute("style")).toBe("left:760px;top:612px");
    specimen.expect(shaped(pop)).toBe(`div.dset(div.views(button.cur(svg.dispg) button(svg.dispg) button(svg.dispg) button(svg.dispg)) div.aligns(button("←") button.cur("→") button("↑") button("↓")) div.shrow(button("−") span.slider.track(span.fill span.sv("38 %")) button("+")))`);
    fire(pop.querySelector("[data-line='/dock left']"), "click");
    specimen.expect(sent).toEqual(["/dock left"]);
    await close();
  });

  specimen.it("the mark: one tap opens the leader's keys; a double tap the palette; a hold the sidebar; a tap with anything open closes all", async () => {
    const { rig, client, close } = await seated();
    client.surface.$sidebar.set(false);
    await settle();
    const mark = () => rig.target.querySelector(".mark");
    specimen.expect(mark().className).toBe("mark");
    fire(mark(), "click");
    await wait(surface.TAP + 40);
    specimen.expect(client.terminal.legend.presses.backlog.map((signal) => signal.nature)).toEqual(["leader"]);
    specimen.expect(mark().className).toBe("mark open");
    specimen.expect(shaped(rig.target.querySelector("section.panel[data-zone='0']"))).toBe(oracle(KEYS));
    fire(mark(), "click");
    await settle();
    await settle();
    specimen.expect(client.terminal.legend.chord).toBe(null);
    specimen.expect(rig.target.querySelector("section.panel").hasAttribute("hidden")).toBe(true);
    specimen.expect(rig.target.querySelector("section.panel").children.length).toBe(0);
    fire(mark(), "click");
    fire(mark(), "click");
    await settle();
    await settle();
    specimen.expect(Array.isArray(client.terminal.repl.catalog)).toBe(true);
    specimen.expect(client.surface.focus).toBe("composer");
    specimen.expect(words(rig.target.querySelector("section.panel .ph .tag"))).toBe("repl");
    specimen.expect(mark().className).toBe("mark open");
    fire(mark(), "click");
    await settle();
    specimen.expect(client.terminal.repl.catalog).toBe(null);
    fire(mark(), "pointerdown");
    await wait(surface.MARK_HOLD + 40);
    fire(mark(), "pointerup");
    fire(mark(), "click");
    await wait(surface.TAP + 40);
    specimen.expect(client.surface.sidebar).toBe(true);
    specimen.expect(client.terminal.legend.chord).toBe(null);
    await close();
  });
});

const words = (element) => element.textContent.trim();
