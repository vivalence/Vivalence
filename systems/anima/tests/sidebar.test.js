import { specimen } from "@vivalence/typology";
import { atom } from "nanostores";
import * as ghost from "@vivalence/ghost";
import { fire, paint, settle, surface, world } from "./world.js";
import { oracle, shaped } from "../../../subsystems/drapes/tests/scenarios/shape.js";

const HEAD = `<div class="sbhead"><span class="t">first words</span><button class="iconbtn" data-line="/sidebar" aria-label="close the sidebar" title="close the sidebar · /sidebar"><svg></svg></button></div>`;

const ENTITY = `<div class="subj " data-sec="entity"><div class="subjh" title="ctrl-v e"><span class="t">entity</span></div><div class="subjb">
<div class="srow sub"><span>terminals</span><span class="c">2</span></div>
<button class="srow item cur" data-line="/terminal 0" title="/terminal 0"><span class="mk">[◇]</span><span class="lab">0  first words</span><span class="sub">chat/chat</span></button>
<button class="srow item " data-line="/terminal 1" title="/terminal 1"><span class="mk">[◇]</span><span class="lab">1  —</span><span class="sub"></span></button>
<div class="srow keys"><button class="sk  " data-line="/terminal/new" title="/terminal/new">new terminal</button><button class="sk  " data-line="/terminal/close" title="/terminal/close">close</button></div>
<div class="srow sub"><span>threads</span><span class="c">1</span></div>
<button class="srow item cur" data-line="/thread thread-1" title="/thread thread-1"><span class="mk">─◇─</span><span class="lab">first words</span><span class="sub">chat/chat</span></button>
<div class="srow keys"><button class="sk  " data-line="/thread/new" title="/thread/new">new thread</button><button class="sk  " data-fn="palette" data-arg="/thread/label " title="/thread/label">label…</button></div>
<div class="srow sub"><span>modes</span><span class="c">1</span></div>
<button class="srow item cur" data-line="/mode chat/chat" title="/mode chat/chat"><span class="mk">‹›</span><span class="lab">chat/chat</span><span class="sub">/runtime/stub</span></button>
<div class="srow sub"><span>buffers</span><span class="c">0</span></div>
<button class="srow more">no buffers</button>
</div></div>`;

const HARNESS = `<div class="subj " data-sec="harness"><div class="subjh" title="ctrl-v h"><span class="t">harness</span></div><div class="subjb">
<div class="srow choice"><span class="cl">tune</span><span class="cc"><button class="">frugal</button><button class="cur">fast</button><button class="">balanced</button><button class="">capable</button><button class="">unleashed</button><button class="">eager</button></span></div>
<div class="srow choice"><span class="cl">effort</span><span class="cc"><button class="">none</button><button class="cur">low</button><button class="">medium</button><button class="">high</button></span></div>
<div class="srow stepper"><span class="cl">rounds</span><button aria-label="less">−</button><span class="v">6</span><button aria-label="more">+</button></div>
<div class="srow meter"><span class="cl">context</span><span class="track"><span class="fill " style="width:0%"></span></span><span class="v">0 %</span></div>
<div class="srow value"><span class="lab">tools</span><span class="v">—</span></div>
</div></div>`;

const TAGS = ["terminals", "threads", "modes", "buffers", "activity", "harness", "display", "box", "system", "control"];

const seated = async () => {
  const held = world();
  held.seat();
  held.authorize();
  held.activate();
  const rig = paint(() => surface.Sidebar({ client: held.client }));
  await settle();
  return { ...held, rig };
};

specimen.describe("sidebar — Dom.sidebar: .sbhead · .sbbody of sections · .sbfoot tags", () => {
  specimen.it("the class tree is the design's: the head, the entity section, the harness section", async () => {
    const { rig } = await seated();
    const aside = rig.target.querySelector("aside.sidebar[data-zone='0']");
    specimen.expect(aside.getAttribute("style")).toBe("--sb-w:272px");
    specimen.expect(shaped(aside.querySelector(".sbhead").parentElement).startsWith(oracle(HEAD))).toBe(true);
    specimen.expect(shaped(aside.querySelector("[data-sec='entity']").parentElement).startsWith(oracle(ENTITY))).toBe(true);
    specimen.expect(`div.subj(${shaped(aside.querySelector("[data-sec='harness']"))})`).toBe(oracle(HARNESS));
    specimen.expect([...aside.querySelectorAll(".subj")].map((section) => section.getAttribute("data-sec"))).toEqual(["entity", "activity", "harness", "display", "box", "system", "control"]);
    specimen.expect([...aside.querySelectorAll(".sbfoot .srow.tags button.on")].map((button) => button.textContent)).toEqual(TAGS);
    rig.close();
  });

  specimen.it("rows are lines: a terminal · a tune chip · a dset view; the screen-only ones move surface atoms", async () => {
    const { rig, sent, client } = await seated();
    fire(rig.target.querySelectorAll(".srow.item")[1], "click");
    fire(rig.target.querySelector("[data-line='/tune capable']"), "click");
    fire(rig.target.querySelector(".dset [data-line='/dock full']"), "click");
    fire(rig.target.querySelector(".dset [aria-label='more']"), "click");
    fire(rig.target.querySelector("[data-line='/dock/lens chat']"), "click");
    specimen.expect(sent).toEqual(["/terminal 1", "/tune capable", "/dock full", "/split 0.43", "/dock/lens chat"]);
    fire(rig.target.querySelector("[data-line='/sidebar/width 296']"), "click");
    fire(rig.target.querySelector("[data-line='/telemetry']"), "click");
    await settle();
    specimen.expect(client.surface.sidebarWidth).toBe(296);
    specimen.expect(rig.target.querySelector("aside.sidebar").getAttribute("style")).toBe("--sb-w:296px");
    specimen.expect(client.surface.tele.open).toBe(true);
    fire(rig.target.querySelector(".sbhead .iconbtn"), "click");
    specimen.expect(client.surface.sidebar).toBe(false);
    specimen.expect(sent.length).toBe(5);
    rig.close();
  });

  specimen.it("a footer tag hides its group; the section drops out of the body", async () => {
    const { rig, client } = await seated();
    fire([...rig.target.querySelectorAll(".sbfoot button")].find((button) => button.textContent === "harness"), "click");
    fire([...rig.target.querySelectorAll(".sbfoot button")].find((button) => button.textContent === "threads"), "click");
    await settle();
    specimen.expect(client.surface.sections.hidden).toEqual(["harness", "threads"]);
    specimen.expect(rig.target.querySelector("[data-sec='harness']")).toBe(null);
    specimen.expect([...rig.target.querySelectorAll("[data-sec='entity'] .srow.sub span:first-child")].map((span) => span.textContent)).toEqual(["terminals", "modes", "buffers"]);
    specimen.expect(rig.target.querySelector(".sbfoot button[aria-pressed='false']").textContent).toBe("threads");
    rig.close();
  });

  specimen.it("past six threads the list folds behind a .sbfilter; typing narrows it and the input node survives", async () => {
    const { rig, entities, thread } = await seated();
    const more = Array.from({ length: 7 }, (_, index) => Object.assign(new ghost.entities.thread.Thread(), { ...thread, id: `thread-${index + 2}`, trait: { ...thread.trait, LABELED: { name: `thread ${index + 2}` } }, $buffers: atom([]) }));
    entities.thread.$entities.set([thread, ...more]);
    await settle();
    const filter = rig.target.querySelector(".sbfilter");
    specimen.expect(shaped(filter)).toBe(oracle(`<button class="fpick  " aria-label="filter by daemon"><svg></svg></button><input id="sbf-thread"><span>8</span>`));
    specimen.expect(filter.querySelector("input").getAttribute("placeholder")).toBe("filter threads");
    specimen.expect(rig.target.querySelector(".srow.more").textContent).toBe("2 more");
    const input = filter.querySelector("input");
    input.value = "thread 8";
    fire(input, "input");
    await settle();
    specimen.expect([...rig.target.querySelectorAll("button.srow.item .mk")].filter((mark) => mark.textContent === "─◇─").map((mark) => mark.nextSibling.textContent)).toEqual(["thread 8"]);
    specimen.expect(rig.target.querySelector(".sbfilter span").textContent).toBe("1 / 8");
    specimen.expect(rig.target.querySelector(".sbfilter input")).toBe(input);
    rig.close();
  });
});
