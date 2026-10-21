import { specimen } from "@vivalence/typology";
import { mime } from "@vivalence/typology";
import { fire, paint, settle, surface, world } from "./world.js";

const LEAVES = ["tabs", "sidebar", "modebar", "fhead", "fbody", "dhead", "journal", "composer", "panel", "strip"];

const named = (element) => {
  const slot = element.getAttribute("data-r");
  const classes = [...element.classList].filter((name) => !["focus", "drag"].includes(name));
  if (classes.length === 0 && slot !== null) return `${element.tagName.toLowerCase()}@${slot}`;
  return [element.tagName.toLowerCase(), ...classes].join(".");
};

const bones = (element) => {
  const leaf = [...element.classList].some((name) => LEAVES.includes(name)) || (element.getAttribute("data-r") !== null && element.classList.length === 0);
  const children = [...element.children];
  return leaf || children.length === 0 ? named(element) : `${named(element)}(${children.map(bones).join(", ")})`;
};

const BUFFER = {
  id: "buffer-1",
  mime: mime.json,
  mode: "chess/chess",
  traits: ["LABELED"],
  trait: { LABELED: { name: "board" } },
  views: [],
  files: [],
  $data: { get: () => ({ turn: "w" }), subscribe: (listener) => (listener({ turn: "w" }), () => {}) },
};

const seated = async (dock, buffer = null) => {
  const held = world();
  held.seat();
  held.authorize();
  held.terminal.dock = { ...held.terminal.dock, ...dock };
  held.terminal.$buffer.set(buffer);
  held.activate();
  const rig = paint(() => surface.Chrome({ client: held.client }));
  await settle();
  const root = () => rig.target.querySelector(".client");
  return { ...held, rig, root };
};

const SLOTS = "section.panel, nav.modebar, div@wid, div@pop, div@tele, div@island";

const ORACLE = {
  docked: `div.client(nav.tabs, div.body(aside.sidebar, div.sbseam, div.split(section.pane.dock(div.dhead, div@strip, div.journal, div.composer))), ${SLOTS})`,
  split: `div.client(nav.tabs, div.body(aside.sidebar, div.sbseam, div.split(section.pane.frame(div.fhead, div.fbody), div.seam.v, section.pane.dock(div.dhead, div@strip, div.journal, div.composer))), ${SLOTS})`,
  closed: `div.client(nav.tabs, div.body(aside.sidebar, div.sbseam, div.split(section.pane.frame(div.fhead, div.fbody))), ${SLOTS})`,
  full: `div.client(nav.tabs, div.body(aside.sidebar, div.sbseam, div.split(section.pane.dock(div.dhead, div@strip, div.journal, div.composer))), ${SLOTS})`,
  messenger: `div.client(nav.tabs, div.body(aside.sidebar, div.sbseam, div.split(section.pane.frame(div.fhead, div.fbody), section.pane.dock.floating(div.dhead, div@strip, div.journal, div.composer, span.dgrip))), ${SLOTS})`,
  minimised: `div.client(nav.tabs, div.body(aside.sidebar, div.sbseam, div.split(section.pane.frame(div.fhead, div.fbody), section.pane.dock.floating.min(div.dhead, div@strip, div.journal, div.composer, span.dgrip))), ${SLOTS})`,
  phoneDock: `div.client.phone(div.body(div.split(section.pane.dock(div.dhead, div@strip, div.journal, div.composer))), ${SLOTS})`,
  phoneFrame: `div.client.phone(div.body(div.split(section.pane.frame(div.fhead, div.fbody))), ${SLOTS})`,
  phoneSidebar: `div.client.phone(div.body(aside.sidebar, div.split), ${SLOTS})`,
};

const sized = (element, rect) => Object.defineProperty(element, "getBoundingClientRect", { value: () => rect });

specimen.describe("anima regions — the design's skeleton (dom.js skeleton) over the real terminal", () => {
  specimen.it("docked, no buffer: frame · seam · dock all the same — the frame shows its empty state", async () => {
    const { rig, root } = await seated({ view: "docked" });
    specimen.expect(bones(root())).toBe(ORACLE.split);
    specimen.expect(root().querySelector(".split").style.flexDirection).toBe("row");
    specimen.expect(root().querySelector(".pane.dock").style.flex).toBe("0 0 38%");
    specimen.expect(root().querySelector(".fbody .empty .cmd").textContent).toBe("/buffer ‹label›");
    specimen.expect(root().querySelector(".pane.dock").getAttribute("data-zone")).toBe("1");
    rig.close();
  });

  specimen.it("docked with a buffer: frame · seam · dock, the dock at its share; left reverses the row", async () => {
    const { rig, root, terminal, entities } = await seated({ view: "docked" }, BUFFER);
    specimen.expect(bones(root())).toBe(ORACLE.split);
    specimen.expect(root().querySelector(".pane.frame").style.flex).toBe("1 1 0");
    specimen.expect(root().querySelector(".pane.dock").style.flex).toBe("0 0 38%");
    specimen.expect(root().querySelector(".seam").getAttribute("title")).toBe("drag · double-click resets · /split");
    specimen.expect(root().querySelector(".fhead .fl").textContent).toBe("◆ artifact");
    specimen.expect(root().querySelector(".fhead .fm").textContent).toBe("chess/chess");
    specimen.expect(root().querySelector(".fhead .asel select").getAttribute("aria-label")).toBe("artifact");
    specimen.expect([...root().querySelectorAll(".fhead .fa .iconbtn")].map((button) => button.getAttribute("aria-label"))).toEqual(["unseat the buffer"]);
    terminal.dock = { ...terminal.dock, align: "left" };
    entities.terminal.$entities.set([...entities.terminal.$entities.get()]);
    await settle();
    specimen.expect(root().querySelector(".split").style.flexDirection).toBe("row-reverse");
    rig.close();
  });

  specimen.it("the seam drags the dock's share live and sends ONE /split at release; double-click resets", async () => {
    const { rig, root, sent } = await seated({ view: "docked" }, BUFFER);
    sized(root().querySelector(".split"), { left: 0, right: 1000, top: 0, bottom: 500, width: 1000, height: 500 });
    const seam = root().querySelector(".seam");
    fire(seam, "pointerdown", { clientX: 600, clientY: 0 });
    specimen.expect(seam.classList.contains("drag")).toBe(true);
    fire(globalThis.window, "pointermove", { clientX: 500, clientY: 0 });
    specimen.expect(root().querySelector(".pane.dock").style.flex).toBe("0 0 50%");
    fire(globalThis.window, "pointerup", { clientX: 450, clientY: 0 });
    fire(seam, "dblclick");
    await settle();
    specimen.expect(sent).toEqual(["/split 0.55", "/split 0.38"]);
    rig.close();
  });

  specimen.it("closed: the frame alone, its empty state names the line; the dock-open button sits in the head", async () => {
    const empty = await seated({ view: "closed" });
    specimen.expect(bones(empty.root())).toBe(ORACLE.closed);
    specimen.expect(empty.root().querySelector(".fbody").innerHTML).toBe('<div class="empty"><div class="sign">◇</div><div>no buffer in the frame</div><div class="cmd">/buffer ‹label›</div></div>');
    empty.rig.close();
    const { rig, root, sent } = await seated({ view: "closed" }, BUFFER);
    const opener = root().querySelector(".fhead [aria-label='open the dock']");
    specimen.expect(opener.getAttribute("title")).toBe("open the dock · /dock docked · hold: display");
    specimen.expect(opener.getAttribute("data-hold")).toBe("pop");
    fire(opener, "click");
    fire(root().querySelector(".fhead [aria-label='unseat the buffer']"), "click");
    await settle();
    specimen.expect(sent).toEqual(["/dock docked", "/buffer/close"]);
    rig.close();
  });

  specimen.it("full: the dock fills the split even with a buffer seated", async () => {
    const { rig, root } = await seated({ view: "full" }, BUFFER);
    specimen.expect(bones(root())).toBe(ORACLE.full);
    specimen.expect(root().querySelector(".pane.dock").style.flex).toBe("1 1 0");
    rig.close();
  });

  specimen.it("the dock head: close · lens cycling chat→repl→trace; the lens and the close are lines", async () => {
    const { rig, root, sent } = await seated({ view: "docked", lens: "repl" });
    const head = root().querySelector(".dhead");
    specimen.expect([...head.children].map((child) => child.className)).toEqual(["iconbtn", "lens"]);
    specimen.expect(head.querySelector(".iconbtn").getAttribute("title")).toBe("close the dock · /dock closed · hold: display");
    specimen.expect(head.querySelector(".lens").textContent).toBe("repl");
    specimen.expect(head.querySelector(".lens").getAttribute("title")).toBe("lens · /dock/lens trace");
    fire(head.querySelector(".lens"), "click");
    fire(head.querySelector(".iconbtn"), "click");
    await settle();
    specimen.expect(sent).toEqual(["/dock/lens trace", "/dock closed"]);
    rig.close();
  });

  specimen.it("messenger: the dock floats in its corner with a grip; minimise folds it to its head with the thread's label", async () => {
    const { rig, root, sent, terminal, client } = await seated({ view: "messenger" });
    specimen.expect(bones(root())).toBe(ORACLE.messenger);
    const dock = root().querySelector(".pane.dock");
    specimen.expect([dock.style.position, dock.style.right, dock.style.bottom]).toEqual(["absolute", "12px", "12px"]);
    specimen.expect(root().querySelector(".dgrip").getAttribute("aria-hidden")).toBe("true");
    const head = root().querySelector(".dhead");
    specimen.expect(head.querySelector(".iconbtn").getAttribute("title")).toBe("dock it · /dock docked · hold: display");
    specimen.expect([...head.querySelectorAll(".iconbtn")].map((button) => button.getAttribute("aria-label"))).toEqual(["close the dock", "minimise", "close the dock"]);
    specimen.expect(head.querySelectorAll(".iconbtn")[2].getAttribute("title")).toBe("close the dock · /dock closed");
    fire(head.querySelector("[aria-label='minimise']"), "click");
    await settle();
    specimen.expect(bones(root())).toBe(ORACLE.minimised);
    specimen.expect(root().querySelector(".dhead .dl").textContent).toBe("first words");
    specimen.expect(root().querySelector(".dhead [aria-label='restore']").getAttribute("title")).toBe("restore · /dock/min");
    specimen.expect(client.surface.float[terminal.id]).toEqual({ float: null, min: true });
    specimen.expect(sent).toEqual([]);
    rig.close();
  });

  specimen.it("messenger: the head drags the float and the grip resizes it, clamped to the split; the place is screen state", async () => {
    const { rig, root, terminal, client } = await seated({ view: "messenger" });
    const dock = root().querySelector(".pane.dock");
    sized(root().querySelector(".split"), { left: 0, right: 1000, top: 0, bottom: 600, width: 1000, height: 600 });
    Object.defineProperties(dock, { offsetLeft: { value: 600 }, offsetTop: { value: 100 }, offsetWidth: { value: 380 }, offsetHeight: { value: 480 } });
    fire(root().querySelector(".dhead"), "pointerdown", { clientX: 700, clientY: 110 });
    fire(globalThis.window, "pointermove", { clientX: 500, clientY: 90 });
    fire(globalThis.window, "pointerup", { clientX: 500, clientY: 90 });
    await settle();
    specimen.expect(client.surface.float[terminal.id].float).toEqual({ x: 400, y: 80, w: 380, h: 480 });
    specimen.expect([dock.style.left, dock.style.top, dock.style.width, dock.style.height]).toEqual(["400px", "80px", "380px", "480px"]);
    fire(root().querySelector(".dgrip"), "pointerdown", { clientX: 780, clientY: 560 });
    fire(globalThis.window, "pointermove", { clientX: 2000, clientY: 2000 });
    fire(globalThis.window, "pointerup", { clientX: 2000, clientY: 2000 });
    await settle();
    specimen.expect(client.surface.float[terminal.id].float).toEqual({ x: 400, y: 80, w: 600, h: 520 });
    rig.close();
  });

  specimen.it("phone: one pane by $phonePane — dock (the frame as a strip), frame (a back button), sidebar; no tabs, no seams", async () => {
    const { rig, root, client, sent } = await seated({ view: "docked" }, BUFFER);
    client.surface.$narrow.set(true);
    await settle();
    specimen.expect(bones(root())).toBe(ORACLE.phoneDock);
    specimen.expect(root().querySelector(".split").style.flexDirection).toBe("column");
    specimen.expect([...root().querySelector(".dhead").children].map((child) => child.className)).toEqual(["lens"]);
    specimen.expect(root().querySelector("[data-r='strip']").innerHTML).toBe('<button type="button" class="strip" title="open the frame"><span class="l">◆ board</span><span class="muted">chess/chess</span><span class="o">⤢</span></button>');
    fire(root().querySelector(".strip"), "click");
    await settle();
    specimen.expect(client.surface.phonePane).toBe("frame");
    specimen.expect(bones(root())).toBe(ORACLE.phoneFrame);
    const back = root().querySelector(".fhead .back");
    specimen.expect(back.getAttribute("aria-label")).toBe("back to the journal");
    fire(back, "click");
    await settle();
    specimen.expect(client.surface.phonePane).toBe("dock");
    client.surface.$phonePane.set("sidebar");
    await settle();
    specimen.expect(bones(root())).toBe(ORACLE.phoneSidebar);
    specimen.expect(sent).toEqual([]);
    rig.close();
  });

  specimen.it("focus wears .focus on the pane it names; a click on the frame takes it", async () => {
    const { rig, root, client } = await seated({ view: "docked" }, BUFFER);
    specimen.expect(root().querySelectorAll(".pane.focus").length).toBe(0);
    fire(root().querySelector(".pane.frame"), "click");
    await settle();
    specimen.expect(client.surface.focus).toBe("frame");
    specimen.expect(root().querySelector(".pane.frame").classList.contains("focus")).toBe(true);
    client.surface.$focus.set("journal");
    await settle();
    specimen.expect(root().querySelector(".pane.dock").classList.contains("focus")).toBe(true);
    specimen.expect(root().querySelector(".pane.frame").classList.contains("focus")).toBe(false);
    rig.close();
  });

  specimen.it("the sidebar seam resizes $sidebarWidth, clamped 220–480", async () => {
    const { rig, root, client } = await seated({ view: "docked" });
    const seam = root().querySelector(".sbseam");
    specimen.expect(seam.getAttribute("title")).toBe("drag to resize · /sidebar/width");
    sized(root().querySelector(".body"), { left: 0, right: 1280, top: 0, bottom: 700, width: 1280, height: 700 });
    fire(seam, "pointerdown", { clientX: 272, clientY: 0 });
    fire(globalThis.window, "pointermove", { clientX: 300.4, clientY: 0 });
    specimen.expect(client.surface.sidebarWidth).toBe(300);
    fire(globalThis.window, "pointermove", { clientX: 900, clientY: 0 });
    fire(globalThis.window, "pointerup", { clientX: 900, clientY: 0 });
    specimen.expect(client.surface.sidebarWidth).toBe(480);
    rig.close();
  });
});
