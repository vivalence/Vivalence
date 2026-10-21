import { specimen } from "@vivalence/typology";
import { fire, paint, settle, surface, world } from "./world.js";
import { oracle, shaped } from "../../../subsystems/drapes/tests/scenarios/shape.js";

const DESIGN = `<button class="tab cur" data-line="/terminal 0" title="first words · chat/chat · /terminal 0"><span class="n">0</span><span>first words</span></button><button class="tab " data-line="/terminal 1" title="— · — · /terminal 1"><span class="n">1</span><span>—</span></button><button class="plus" data-line="/terminal/new" aria-label="new terminal" title="new terminal · /terminal/new"><svg></svg></button>`;

const seated = async () => {
  const held = world();
  held.seat();
  held.authorize();
  held.activate();
  const rig = paint(() => surface.Tabs({ client: held.client }));
  await settle();
  return { ...held, rig };
};

specimen.describe("tabs — Dom.tabs over the terminal rows", () => {
  specimen.it("the class tree is the design's: .tab.cur · .n · label · .plus", async () => {
    const { rig } = await seated();
    const nav = rig.target.querySelector("nav.tabs[data-zone='0'][aria-label='terminals']");
    specimen.expect(shaped(nav)).toBe(oracle(DESIGN));
    specimen.expect([...nav.querySelectorAll("button")].map((button) => button.getAttribute("data-line"))).toEqual(["/terminal 0", "/terminal 1", "/terminal/new"]);
    specimen.expect(nav.querySelector(".tab.cur").getAttribute("title")).toBe("first words · chat/chat · /terminal 0");
    rig.close();
  });

  specimen.it("a mirrored thread wears ∥; a running activity a .dot.pri.live; a paused one .dot.cau.breathe", async () => {
    const { rig, entities, spare, thread } = await seated();
    spare.$thread.set(thread);
    entities.activity.$entities.set([{ id: "activity-1", type: "HALLUCINATION", status: "RUNNING", steps: [], thread }]);
    entities.terminal.$entities.set([...entities.terminal.$entities.get()]);
    await settle();
    const tabs = [...rig.target.querySelectorAll(".tab")];
    specimen.expect(tabs.map((tab) => shaped(tab))).toEqual([`span.n("0") span("first words") span.mirror("∥") span.dot.live.pri`, `span.n("1") span("first words") span.mirror("∥") span.dot.live.pri`]);
    entities.activity.$entities.set([{ id: "activity-1", type: "HALLUCINATION", status: "PAUSED", steps: [], thread }]);
    await settle();
    specimen.expect(rig.target.querySelector(".tab .dot").className).toBe("dot cau breathe");
    rig.close();
  });

  specimen.it("a tab and the plus are lines", async () => {
    const { rig, sent } = await seated();
    fire(rig.target.querySelectorAll(".tab")[1], "click");
    fire(rig.target.querySelector(".plus"), "click");
    specimen.expect(sent).toEqual(["/terminal 1", "/terminal/new"]);
    rig.close();
  });
});
