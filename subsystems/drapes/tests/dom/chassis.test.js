import { specimen } from "@vivalence/typology";
import { fire, fresh, surface, world } from "./rig.js";

const DOCK = { side: "right", vertical: true, share: 0.32, direction: "row", dimension: 1000, size: 320, full: false, collapsed: false };

const dock = (overrides = {}) => ({ ...DOCK, ...overrides });

const layout = (overrides = {}, buffer = true) => ({ panes: ["crown", "navigation", "dock", "frame"], dock: dock(overrides), buffer });

const assembled = async () => {
  const module = await surface;
  const { root } = fresh();
  const bag = module.dom(root, { credentials: null });
  const held = world();
  held.terminal.$buffer.set({ id: "buffer-1", bundle: null, data: {} });
  const sent = held.sent;
  const props = held.client;
  const handles = Object.fromEntries(["crown", "navigation", "dock", "frame"].map((pane) => [pane, bag.mount[pane](props)]));
  const place = (next) => Object.values(handles).forEach((handle) => handle.place(next));
  const region = (pane) => root.querySelector(`[data-pane=${pane}]`);
  const shown = () => Object.fromEntries(["crown", "navigation", "signin", "frame", "dock"].map((pane) => [pane, !region(pane).hidden]));
  const handle = root.querySelector(".chassis-handle");
  const stage = root.querySelector(".chassis-stage");
  return { module, root, bag, held, sent, props, handles, place, region, shown, handle, stage };
};

specimen.describe("dom chassis — arrangement is a function of the mounted panes and the layout", () => {
  const TABLE = [
    [["dock"], null, { dock: true, frame: false, handle: false }],
    [["dock", "frame"], layout({}, false), { dock: true, frame: false, handle: false }],
    [["dock", "frame"], layout(), { dock: true, frame: true, handle: true }],
    [["dock", "frame"], layout({ collapsed: true }), { dock: false, frame: true, handle: false }],
    [["dock", "frame"], layout({ full: true }), { dock: true, frame: false, handle: false }],
    [["frame"], layout({ full: true }), { dock: false, frame: true, handle: false }],
    [["dock", "frame", "signin"], layout(), { dock: false, frame: false, handle: false }],
  ];
  for (const [mounted, held, expected] of TABLE) {
    const named = held === null ? "no layout" : JSON.stringify({ buffer: held.buffer, full: held.dock.full, collapsed: held.dock.collapsed });
    specimen.it(`${mounted.join(" + ")} over ${named}`, async () => {
      const module = await surface;
      const arranged = module.arrangement(mounted, held);
      specimen.expect({ dock: arranged.dock, frame: arranged.frame, handle: arranged.handle }).toEqual(expected);
    });
  }
});

specimen.describe("dom chassis — place(layout) re-lays one chassis", () => {
  specimen.it("splits the stage: frame beside the dock at dock.share, along flexDirection(side)", async () => {
    const { place, shown, region, stage, handle } = await assembled();
    place(layout());
    specimen.expect(shown()).toEqual({ crown: true, navigation: true, signin: false, frame: true, dock: true });
    specimen.expect(handle.hidden).toBe(false);
    specimen.expect(region("dock").style.flex).toBe("0 0 32%");
    specimen.expect(stage.style.flexDirection).toBe("row");
    place(layout({ side: "left", direction: "row-reverse", share: 0.5 }));
    specimen.expect([stage.style.flexDirection, region("dock").style.flex]).toEqual(["row-reverse", "0 0 50%"]);
    place(layout({ side: "bottom", vertical: false, direction: "column" }));
    specimen.expect([stage.style.flexDirection, handle.classList.contains("chassis-handle-vertical")]).toEqual(["column", false]);
  });

  specimen.it("no buffer leaves the dock alone, filling the stage", async () => {
    const { place, shown, region, handle } = await assembled();
    place(layout({}, false));
    specimen.expect([shown().dock, shown().frame, handle.hidden, region("dock").style.flex]).toEqual([true, false, true, "1 1 auto"]);
  });

  specimen.it("collapsed hides the dock behind the frame; full hides the frame behind the dock", async () => {
    const { place, shown } = await assembled();
    place(layout({ collapsed: true }));
    specimen.expect([shown().dock, shown().frame]).toEqual([false, true]);
    place(layout({ full: true }));
    specimen.expect([shown().dock, shown().frame]).toEqual([true, false]);
  });

  specimen.it("signin replaces the stage and its destroy gives it back", async () => {
    const { bag, props, place, shown } = await assembled();
    place(layout());
    const signin = bag.mount.signin(props);
    specimen.expect(shown()).toEqual({ crown: true, navigation: true, signin: true, frame: false, dock: false });
    signin.destroy();
    specimen.expect([shown().signin, shown().frame, shown().dock]).toEqual([false, true, true]);
  });

  specimen.it("destroy unmounts only its own pane", async () => {
    const { handles, region, shown } = await assembled();
    handles.navigation.destroy();
    specimen.expect([region("navigation").childNodes.length, shown().navigation, region("crown").childNodes.length > 0]).toEqual([0, false, true]);
  });
});

specimen.describe("dom chassis — the handle drags the share through the dock belt", () => {
  const grip = (handle, stage) => {
    Object.defineProperty(stage, "clientWidth", { configurable: true, value: 1000 });
    Object.defineProperty(stage, "clientHeight", { configurable: true, value: 800 });
    handle.setPointerCapture = () => {};
    handle.releasePointerCapture = () => {};
  };

  specimen.it("a drag dispatches /dock/share per move and the snapped share on drop", async () => {
    const { place, handle, stage, sent } = await assembled();
    place(layout());
    grip(handle, stage);
    fire(handle, "pointerdown", { pointerId: 1, clientX: 700, clientY: 400 });
    fire(handle, "pointermove", { pointerId: 1, clientX: 650, clientY: 400 });
    fire(handle, "pointermove", { pointerId: 1, clientX: 600, clientY: 400 });
    fire(handle, "pointerup", { pointerId: 1, clientX: 600, clientY: 400 });
    specimen.expect(sent.map((line) => line.split(" ")).map(([nature, share]) => [nature, Math.round(Number(share) * 100) / 100])).toEqual([
      ["/dock/share", 0.37],
      ["/dock/share", 0.42],
      ["/dock/share", 0.42],
    ]);
  });

  specimen.it("dropping the dock at its floor collapses it; at its ceiling makes it full", async () => {
    const floor = await assembled();
    floor.place(layout());
    grip(floor.handle, floor.stage);
    fire(floor.handle, "pointerdown", { pointerId: 1, clientX: 700, clientY: 0 });
    fire(floor.handle, "pointermove", { pointerId: 1, clientX: 900, clientY: 0 });
    fire(floor.handle, "pointerup", { pointerId: 1, clientX: 900, clientY: 0 });
    specimen.expect(floor.sent.slice(-2)).toEqual([
      "/dock/share 0.32",
      "/dock/collapse true",
    ]);

    const ceiling = await assembled();
    ceiling.place(layout());
    grip(ceiling.handle, ceiling.stage);
    fire(ceiling.handle, "pointerdown", { pointerId: 1, clientX: 700, clientY: 0 });
    fire(ceiling.handle, "pointermove", { pointerId: 1, clientX: 50, clientY: 0 });
    fire(ceiling.handle, "pointerup", { pointerId: 1, clientX: 50, clientY: 0 });
    specimen.expect(ceiling.sent.slice(-2)).toEqual([
      "/dock/share 0.32",
      "/dock/full true",
    ]);
  });

  specimen.it("a move without a press dispatches nothing", async () => {
    const { place, handle, stage, sent } = await assembled();
    place(layout());
    grip(handle, stage);
    fire(handle, "pointermove", { pointerId: 1, clientX: 10, clientY: 0 });
    fire(handle, "pointerup", { pointerId: 1, clientX: 10, clientY: 0 });
    specimen.expect(sent).toEqual([]);
  });
});
