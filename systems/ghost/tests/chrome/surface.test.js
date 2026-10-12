import * as kit from "../../chrome/index.js";
import { RAIL } from "@vivalence/sheets";
import { mime, specimen } from "@vivalence/typology";
import { layout, screen, settle, SPLIT, world } from "./world.js";

const BLOCKS = [{ heading: "viva ledger/doctor" }, { spans: [{ text: "✓", tone: "positive" }, { text: "ledger", tone: "strong" }], depth: 1 }];

const chrome = async (panes, extra = {}) => {
  const setup = await screen();
  const held = world();
  held.terminals.seated.$buffer.set(held.buffer);
  const surface = kit.tty(setup.renderer, { credentials: null });
  const handles = Object.fromEntries(panes.map((pane) => [pane, surface.mount[pane](held.client)]));
  for (const handle of Object.values(handles)) handle.place(layout(panes, { buffer: true, ...extra }));
  await settle(setup);
  return { setup, held, surface, handles, frame: () => setup.captureCharFrame(), lines: () => setup.captureCharFrame().split("\n") };
};

const column = (lines, needle) => {
  const line = lines.find((each) => each.includes(needle));
  specimen.expect(line).toBeDefined();
  return line.indexOf(needle);
};

specimen.describe("tty(renderer, { credentials, theme }) — the bag", () => {
  specimen.it("names itself, reads the viewport, accepts tty.solid · markdown · plain · json, mounts the five panes", async () => {
    const setup = await screen({ width: 90, height: 20 });
    const credentials = kit.credentials(`${Deno.makeTempDirSync()}/credentials.json`);
    const surface = kit.tty(setup.renderer, { credentials });
    specimen.expect(surface.name).toBe("tty");
    specimen.expect(surface.interactive).toBe(true);
    specimen.expect(surface.viewport()).toEqual({ width: 90, height: 20 });
    specimen.expect(surface.credentials).toBe(credentials);
    specimen.expect(surface.accept).toEqual([mime.tty.solid, mime.markdown, mime.plain, mime.json]);
    specimen.expect(Object.keys(surface.mount)).toEqual(["signin", "crown", "dock", "frame", "navigation"]);
    specimen.expect(typeof surface.emit).toBe("function");
    specimen.expect(typeof surface.hold).toBe("function");
    setup.renderer.destroy();
  });

  specimen.it("an unknown theme throws at the surface, before anything paints", async () => {
    const setup = await screen();
    specimen.expect(() => kit.tty(setup.renderer, { credentials: null, theme: "dark" })).toThrow(/not a theme/);
    specimen.expect(setup.renderer.root.getChildren().length).toBe(0);
    setup.renderer.destroy();
  });
});

specimen.describe("the chassis — crown on top, a RAIL-col navigation, the stage split by layout.dock", () => {
  specimen.it("crown · navigation · frame · dock with the dock on the right at dock.size", async () => {
    const view = await chrome(["crown", "navigation", "dock", "frame"]);
    const lines = view.lines();
    specimen.expect(lines[0]).toContain("✦ hello-world · beef · #k1 · core › greeter");
    specimen.expect(lines[1].indexOf("│")).toBe(RAIL - 1);
    specimen.expect(column(lines, "buffer #b1")).toBeGreaterThan(RAIL);
    specimen.expect(column(lines, "› first question")).toBeGreaterThan(column(lines, "buffer #b1"));
    specimen.expect(column(lines, "› first question")).toBeGreaterThanOrEqual(100 - 32);
    view.setup.renderer.destroy();
  });

  specimen.it("a left dock sits between the rail and the frame", async () => {
    const view = await chrome(["crown", "navigation", "dock", "frame"], {
      dock: { side: "left", vertical: true, share: 0.32, direction: "row-reverse", dimension: 100, size: 32, full: false },
    });
    const lines = view.lines();
    specimen.expect(column(lines, "› first question")).toBeLessThan(column(lines, "buffer #b1"));
    specimen.expect(column(lines, "› first question")).toBeGreaterThanOrEqual(RAIL);
    view.setup.renderer.destroy();
  });

  specimen.it("a bottom dock sits under the frame", async () => {
    const view = await chrome(["crown", "navigation", "dock", "frame"], {
      dock: { side: "bottom", vertical: false, share: 0.32, direction: "column", dimension: 30, size: 10, full: false },
    });
    const lines = view.lines();
    specimen.expect(lines.findIndex((line) => line.includes("› first question"))).toBeGreaterThan(lines.findIndex((line) => line.includes("buffer #b1")));
    view.setup.renderer.destroy();
  });

  specimen.it("full → the frame alone; no buffer → the dock alone", async () => {
    const view = await chrome(["crown", "navigation", "dock", "frame"], {
      dock: { side: "right", vertical: true, share: 0.32, direction: "row", dimension: 100, size: 32, full: true },
    });
    specimen.expect(view.frame()).toContain("buffer #b1");
    specimen.expect(view.frame()).not.toContain("first question");
    for (const handle of Object.values(view.handles)) handle.place(layout(["crown", "navigation", "dock"], { buffer: false }));
    view.handles.frame.destroy();
    await settle(view.setup);
    specimen.expect(view.frame()).toContain("first question");
    specimen.expect(view.frame()).not.toContain("buffer #b1");
    specimen.expect(column(view.lines(), "› first question")).toBeLessThan(RAIL + 3);
    view.setup.renderer.destroy();
  });

  specimen.it("signin covers the stage", async () => {
    const view = await chrome(["crown", "signin"]);
    specimen.expect(view.frame()).toContain("sign in");
    specimen.expect(view.frame()).not.toContain("first question");
    specimen.expect(view.lines()[0]).toContain("✦ hello-world");
    view.setup.renderer.destroy();
  });

  specimen.it("destroy empties the pane's slot and nothing else", async () => {
    const view = await chrome(["crown", "navigation", "dock"]);
    view.handles.navigation.destroy();
    await settle(view.setup);
    specimen.expect(view.frame()).not.toContain("● core");
    specimen.expect(view.frame()).toContain("first question");
    specimen.expect(view.lines()[0]).toContain("✦ hello-world");
    view.setup.renderer.destroy();
  });
});

specimen.describe("emit(kind, props) — sets $output = { kind, props }, the dock paints it", () => {
  specimen.it("returns at once and repaints the mounted dock on every emit", async () => {
    const view = await chrome(["crown", "navigation", "dock"]);
    specimen.expect(view.surface.emit("output", { fault: "the daemon is gone" })).toBe(undefined);
    await settle(view.setup);
    specimen.expect(view.frame()).toContain("✕ fault");
    view.surface.emit("report", { blocks: BLOCKS });
    await settle(view.setup);
    specimen.expect(view.frame()).toContain("viva ledger/doctor");
    specimen.expect(view.frame()).not.toContain("✕ fault");
    view.setup.renderer.destroy();
  });

  specimen.it("an emit before the dock mounts is what the dock paints first", async () => {
    const setup = await screen();
    const held = world();
    const surface = kit.tty(setup.renderer, { credentials: null });
    surface.emit("output", { refused: "not yet" });
    surface.mount.dock(held.client).place(layout(["dock"]));
    await settle(setup);
    specimen.expect(setup.captureCharFrame()).toContain("⊘ refused");
    specimen.expect(setup.captureCharFrame()).toContain("not yet");
    setup.renderer.destroy();
  });
});

specimen.describe("hold(kind, props) — a captured kind, live until it releases, the last frame stays in scrollback", () => {
  specimen.it("a held report paints inline, enter releases it into scrollback", async () => {
    const setup = await screen(SPLIT);
    const surface = kit.tty(setup.renderer, { credentials: null });
    const released = surface.hold("report", { blocks: BLOCKS });
    await settle(setup);
    specimen.expect(setup.captureCharFrame()).toContain("viva ledger/doctor");
    specimen.expect(setup.externalOutput.takeText()).toBe("");
    setup.mockInput.pressEnter();
    specimen.expect(await released).toBe(true);
    await settle(setup);
    specimen.expect(setup.externalOutput.takeText()).toContain("viva ledger/doctor");
    specimen.expect(setup.captureCharFrame()).not.toContain("viva ledger/doctor");
    setup.renderer.destroy();
  });

  specimen.it("an unknown kind throws naming the kinds", async () => {
    const setup = await screen(SPLIT);
    const surface = kit.tty(setup.renderer, { credentials: null });
    specimen.expect(() => surface.hold("ticker", {})).toThrow(/no kind "ticker" · report · listing/);
    setup.renderer.destroy();
  });
});

specimen.describe("keys — an async iterable of /key lines", () => {
  specimen.it("yields printable · named · ctrl presses in order", async () => {
    const setup = await screen();
    const surface = kit.tty(setup.renderer, { credentials: null });
    const first = surface.keys.next();
    await setup.mockInput.typeText("a");
    setup.mockInput.pressArrow("down");
    setup.mockInput.pressEnter();
    setup.mockInput.pressKey("t", { ctrl: true });
    const presses = [(await first).value];
    for (let index = 0; index < 3; index++) presses.push((await surface.keys.next()).value);
    specimen.expect(presses).toEqual(["/key/a", "/key/down", "/key/enter", "/key/ctrl-t"]);
    setup.renderer.destroy();
    specimen.expect((await surface.keys.next()).done).toBe(true);
  });
});
