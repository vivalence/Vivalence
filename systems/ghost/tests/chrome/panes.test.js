import * as kit from "../../chrome/index.js";
import { BoxRenderable } from "@opentui/core";
import { atom } from "nanostores";
import { specimen } from "@vivalence/typology";
import { layout, screen, settle, THEMES, world } from "./world.js";

const PANES = ["signin", "crown", "dock", "frame", "navigation"];

const mounted = async (pane, { theme = "northsea", held = world(), extra = {}, size = {} } = {}) => {
  const setup = await screen(size);
  const surface = kit.tty(setup.renderer, { credentials: null, theme });
  const handle = surface.mount[pane](held.client);
  handle.place(layout([pane], extra));
  await settle(setup);
  return { setup, surface, handle, held, frame: () => setup.captureCharFrame() };
};

const lines = (frame) => frame.split("\n");

const below = (frame, first, second) => {
  const index = (needle) => lines(frame).findIndex((line) => line.includes(needle));
  specimen.expect(index(first)).toBeGreaterThan(-1);
  specimen.expect(index(second)).toBeGreaterThan(index(first));
};

const counted = (frame, needle) => lines(frame).filter((line) => line.includes(needle)).length;

specimen.describe("every pane mounts in every dapper theme", () => {
  for (const theme of THEMES) {
    for (const pane of PANES) {
      specimen.it(`${pane} × ${theme}`, async () => {
        const view = await mounted(pane, { theme, extra: { buffer: pane === "frame" } });
        specimen.expect(view.frame().trim().length).toBeGreaterThan(0);
        view.handle.destroy();
        view.setup.renderer.destroy();
      });
    }
  }
});

specimen.describe("crown", () => {
  specimen.it("shows ✦ instance · user · #terminal · host › mode", async () => {
    const view = await mounted("crown");
    specimen.expect(lines(view.frame())[0]).toContain("✦ hello-world · beef · #k1 · core › greeter");
    specimen.expect(view.frame()).not.toContain("streaming");
    view.setup.renderer.destroy();
  });

  specimen.it("names the daemon when the seated thread's mode is the daemon's", async () => {
    const held = world();
    held.terminals.seated.$thread.set(held.threads.quiz);
    const view = await mounted("crown", { held });
    specimen.expect(lines(view.frame())[0]).toContain("✦ hello-world · beef · #k1 · education › drill");
    view.setup.renderer.destroy();
  });

  specimen.it("follows the active terminal", async () => {
    const view = await mounted("crown");
    view.held.client.terminals.$active.set(view.held.terminals.spare);
    await settle(view.setup);
    specimen.expect(lines(view.frame())[0].trim()).toBe("✦ hello-world · beef · #k2");
    view.setup.renderer.destroy();
  });

  specimen.it("● streaming while the thread's $live is non-null, offline on the lighthouse's OFFLINE", async () => {
    const view = await mounted("crown");
    view.held.threads.hello.$live.set({ open: null, turns: [] });
    view.held.lighthouse.$status.set({ code: "OFFLINE", message: "Network unavailable" });
    await settle(view.setup);
    specimen.expect(lines(view.frame())[0]).toContain("› greeter · ● streaming");
    specimen.expect(lines(view.frame())[0]).toContain("offline");
    view.setup.renderer.destroy();
  });

  specimen.it("no active terminal shows instance · user alone", async () => {
    const held = world();
    held.client.terminals.$active.set(null);
    const view = await mounted("crown", { held });
    specimen.expect(lines(view.frame())[0].trim()).toBe("✦ hello-world · beef");
    view.setup.renderer.destroy();
  });
});

specimen.describe("signin", () => {
  specimen.it("shows sign up only when the lighthouse is JOINABLE", async () => {
    const open = await mounted("signin");
    specimen.expect(open.frame()).toContain("sign in");
    specimen.expect(open.frame()).toContain("sign up");
    open.setup.renderer.destroy();
    const held = world();
    held.lighthouse.manifest = { traits: [] };
    const closed = await mounted("signin", { held });
    specimen.expect(closed.frame()).toContain("sign in");
    specimen.expect(closed.frame()).not.toContain("sign up");
    closed.setup.renderer.destroy();
    const unknown = world();
    unknown.lighthouse.manifest = null;
    const pending = await mounted("signin", { held: unknown });
    specimen.expect(pending.frame()).not.toContain("sign up");
    pending.setup.renderer.destroy();
  });

  specimen.it("shows the lighthouse status's message", async () => {
    const view = await mounted("signin");
    view.held.lighthouse.$status.set({ code: "ERROR", message: "wrong password" });
    await settle(view.setup);
    specimen.expect(view.frame()).toContain("wrong password");
    view.setup.renderer.destroy();
  });

  specimen.it("typed name · tab · masked password · enter calls lighthouse.login once", async () => {
    const view = await mounted("signin");
    await view.setup.mockInput.typeText("beef");
    view.setup.mockInput.pressTab();
    await view.setup.mockInput.typeText("hunter2");
    await settle(view.setup);
    specimen.expect(view.frame()).toContain("beef");
    specimen.expect(view.frame()).not.toContain("hunter2");
    specimen.expect(view.frame()).toContain("•••••••");
    view.setup.mockInput.pressEnter();
    await settle(view.setup);
    specimen.expect(view.held.accessed).toEqual([{ route: "/lighthouse/login", username: "beef", password: "hunter2" }]);
    view.setup.renderer.destroy();
  });

  specimen.it("enter on the username moves to the password, never submits", async () => {
    const view = await mounted("signin");
    await view.setup.mockInput.typeText("beef");
    view.setup.mockInput.pressEnter();
    await view.setup.mockInput.typeText("pw");
    await settle(view.setup);
    specimen.expect(view.held.accessed).toEqual([]);
    specimen.expect(view.frame()).toContain("••");
    view.setup.renderer.destroy();
  });

  specimen.it("sign up calls lighthouse.signup", async () => {
    const view = await mounted("signin");
    await view.setup.mockInput.typeText("new");
    view.setup.mockInput.pressTab();
    await view.setup.mockInput.typeText("pw");
    view.setup.mockInput.pressTab();
    view.setup.mockInput.pressTab();
    view.setup.mockInput.pressEnter();
    await settle(view.setup);
    specimen.expect(view.held.accessed).toEqual([{ route: "/lighthouse/signup", username: "new", password: "pw" }]);
    view.setup.renderer.destroy();
  });
});

const BLOCKS = [{ heading: "viva ledger/doctor" }, { spans: [{ text: "✓", tone: "positive" }, { text: "ledger", tone: "strong" }], depth: 1 }];

const LISTING = {
  title: "viva",
  groups: [{ title: "registry", rows: [{ name: "registry/tap", usage: "[location]", note: "tap a package" }] }],
  notes: ["viva help <prefix> narrows"],
};

specimen.describe("dock", () => {
  specimen.it("lists the active thread's turns in order, then the echo, then the composer, then the keys", async () => {
    const view = await mounted("dock");
    view.held.threads.hello.$echo.set(view.held.turn("user", "just sent"));
    await settle(view.setup);
    const frame = view.frame();
    below(frame, "first question", "first answer");
    below(frame, "first answer", "second question");
    below(frame, "second question", "just sent");
    below(frame, "just sent", "<< ▌");
    below(frame, "<< ▌", "enter  send");
    view.setup.renderer.destroy();
  });

  specimen.it("a new turn on the thread lands under the old ones", async () => {
    const view = await mounted("dock");
    view.held.threads.hello.$turns.set([...view.held.threads.hello.$turns.get(), view.held.turn("assistant", "second answer")]);
    await settle(view.setup);
    below(view.frame(), "second question", "second answer");
    view.setup.renderer.destroy();
  });

  specimen.it("follows the active terminal's thread", async () => {
    const view = await mounted("dock");
    view.held.threads.quiz.$turns.set([view.held.turn("user", "quiz me")]);
    view.held.terminals.seated.$thread.set(view.held.threads.quiz);
    await settle(view.setup);
    specimen.expect(view.frame()).toContain("quiz me");
    specimen.expect(view.frame()).not.toContain("first question");
    view.setup.renderer.destroy();
  });

  specimen.it("renders the live transcript with its open turn", async () => {
    const view = await mounted("dock");
    view.held.threads.hello.$live.set({ turns: [view.held.turn("assistant", "sealed part")], open: view.held.turn("assistant", "still typing") });
    await settle(view.setup);
    below(view.frame(), "sealed part", "still typing");
    specimen.expect(view.frame()).toContain("streaming");
    view.setup.renderer.destroy();
  });

  specimen.it("enter sends the draft through client.dispatch and clears the composer", async () => {
    const view = await mounted("dock");
    await view.setup.mockInput.typeText("ciao");
    await settle(view.setup);
    specimen.expect(view.frame()).toContain("<< ciao▌");
    view.setup.mockInput.pressEnter();
    await view.setup.mockInput.typeText("/help");
    view.setup.mockInput.pressEnter();
    view.setup.mockInput.pressEnter();
    await settle(view.setup);
    specimen.expect(view.held.dispatched).toEqual(["ciao", "/help"]);
    specimen.expect(view.frame()).toContain("<< ▌");
    view.setup.renderer.destroy();
  });

  specimen.it("paints $output by kind: output (fault · refused · a JSON tree) · listing · report · null", async () => {
    const view = await mounted("dock");
    view.surface.emit("output", { fault: "the daemon is gone" });
    await settle(view.setup);
    specimen.expect(view.frame()).toContain("✕ fault");
    specimen.expect(view.frame()).toContain("the daemon is gone");
    view.surface.emit("output", { refused: "not on this thread" });
    await settle(view.setup);
    specimen.expect(view.frame()).toContain("⊘ refused");
    specimen.expect(view.frame()).toContain("not on this thread");
    view.surface.emit("output", { instance: { slug: "hello-world", daemons: 2 } });
    await settle(view.setup);
    specimen.expect(view.frame()).toContain('slug: "hello-world"');
    specimen.expect(view.frame()).toContain("daemons: 2");
    view.surface.emit("listing", LISTING);
    await settle(view.setup);
    specimen.expect(view.frame()).toContain("registry/tap");
    specimen.expect(view.frame()).toContain("tap a package");
    view.surface.emit("report", { blocks: BLOCKS });
    await settle(view.setup);
    specimen.expect(view.frame()).toContain("viva ledger/doctor");
    specimen.expect(view.frame()).not.toContain("registry/tap");
    view.setup.renderer.destroy();
  });

  specimen.it("painted names the kinds it knows and paints nothing for null", () => {
    specimen.expect(kit.panes.painted(null)).toBe(null);
    specimen.expect(() => kit.panes.painted({ kind: "confirm", props: {} })).toThrow(/no kind "confirm" · output · listing · report/);
  });
});

specimen.describe("frame", () => {
  specimen.it("falls through to the JSON floor when the buffer's bundle offers no entry", async () => {
    const view = await mounted("frame", { extra: { buffer: true } });
    specimen.expect(view.frame()).toContain("no buffer");
    view.held.terminals.seated.$buffer.set(view.held.buffer);
    await settle(view.setup);
    specimen.expect(view.frame()).toContain("buffer #b1");
    specimen.expect(view.frame()).toContain('lemma: "essere"');
    specimen.expect(view.frame()).toContain('0: "sono"');
    view.held.buffer.$data.set({ lemma: "avere" });
    await settle(view.setup);
    specimen.expect(view.frame()).toContain('lemma: "avere"');
    view.setup.renderer.destroy();
  });

  specimen.it("a bundle offering only a dom entry still falls to the floor", async () => {
    const held = world();
    const offered = { ...held.buffer, $bundle: atom({ negotiate: (accept) => (accept.includes("application/vnd.vivalence.dom.svelte+javascript") ? {} : null) }) };
    held.terminals.seated.$buffer.set(offered);
    const view = await mounted("frame", { held, extra: { buffer: true } });
    specimen.expect(view.frame()).toContain('lemma: "essere"');
    view.setup.renderer.destroy();
  });

  specimen.it("a tty entry loads with the surface's accept and mounts module.default(element, terminal)", async () => {
    const held = world();
    const calls = [];
    const offered = {
      ...held.buffer,
      $bundle: atom({
        negotiate: (accept) => (accept[0] === "application/vnd.vivalence.tty.solid+javascript" ? { mime: accept[0] } : null),
        load: (accept) =>
          Promise.resolve({
            default: (element, terminal) => {
              calls.push({ accept, terminal: terminal.id, buffer: terminal.buffer.id, boxed: element instanceof BoxRenderable });
              return { destroy: () => calls.push("destroyed") };
            },
          }),
      }),
    };
    held.terminals.seated.$buffer.set(offered);
    const view = await mounted("frame", { held, extra: { buffer: true } });
    specimen.expect(view.frame()).not.toContain("lemma");
    specimen.expect(calls[0].terminal).toBe("k1");
    specimen.expect(calls[0].buffer).toBe("b1");
    specimen.expect(calls[0].boxed).toBe(true);
    specimen.expect(calls[0].accept).toEqual(view.surface.accept);
    held.terminals.seated.$buffer.set(null);
    await settle(view.setup);
    specimen.expect(calls[1]).toBe("destroyed");
    view.setup.renderer.destroy();
  });

  specimen.it("a buffer with no bundle of its own mounts its APPLICATION mode's bundle; the view gets the renderer and the palette", async () => {
    const held = world();
    const kits = [];
    const mode = {
      implements: (trait) => trait === "APPLICATION",
      $application: atom({
        bundle: {
          negotiate: (accept) => (accept[0] === "application/vnd.vivalence.tty.solid+javascript" ? { mime: accept[0] } : null),
          load: () => Promise.resolve({ default: (element, terminal, kit) => (kits.push(kit), { destroy: () => {} }) }),
        },
      }),
    };
    held.terminals.seated.$buffer.set({ ...held.buffer, mode });
    const view = await mounted("frame", { held, extra: { buffer: true } });
    specimen.expect(view.frame()).not.toContain("lemma");
    specimen.expect(kits.length).toBe(1);
    specimen.expect(kits[0].renderer).toBe(view.setup.renderer);
    specimen.expect(typeof kits[0].palette.textInk).toBe("string");
    view.setup.renderer.destroy();
  });

  specimen.it("an APPLICATION mode whose application has not arrived shows the floor, then mounts the view when it lands", async () => {
    const held = world();
    const mounts = [];
    const mode = { implements: (trait) => trait === "APPLICATION", $application: atom(null) };
    held.terminals.seated.$buffer.set({ ...held.buffer, mode });
    const view = await mounted("frame", { held, extra: { buffer: true } });
    specimen.expect(view.frame()).toContain('lemma: "essere"');
    mode.$application.set({
      bundle: {
        negotiate: (accept) => (accept[0] === "application/vnd.vivalence.tty.solid+javascript" ? { mime: accept[0] } : null),
        load: () => Promise.resolve({ default: (element, terminal) => (mounts.push(terminal.id), { destroy: () => {} }) }),
      },
    });
    await settle(view.setup);
    specimen.expect(view.frame()).not.toContain("lemma");
    specimen.expect(mounts).toEqual(["k1"]);
    view.setup.renderer.destroy();
  });

  specimen.it("a buffer whose mode is still an id — its host not mounted — falls to the floor", async () => {
    const held = world();
    held.terminals.seated.$buffer.set({ ...held.buffer, mode: "m9" });
    const view = await mounted("frame", { held, extra: { buffer: true } });
    specimen.expect(view.frame()).toContain('lemma: "essere"');
    view.setup.renderer.destroy();
  });

  specimen.it("a failing load paints its fault", async () => {
    const held = world();
    const offered = { ...held.buffer, $bundle: atom({ negotiate: () => ({}), load: () => Promise.reject(new Error("bundle is gone")) }) };
    held.terminals.seated.$buffer.set(offered);
    const view = await mounted("frame", { held, extra: { buffer: true } });
    specimen.expect(view.frame()).toContain("✕ bundle is gone");
    view.setup.renderer.destroy();
  });
});

specimen.describe("navigation", () => {
  specimen.it("lists host › traits › mode › thread, terminals as tabs on top, each mode once under its own host", async () => {
    const view = await mounted("navigation");
    const frame = view.frame();
    specimen.expect(lines(frame)[0]).toContain(" #k1 ");
    specimen.expect(lines(frame)[0]).toContain(" #k2 ");
    below(frame, "#k1", "● core");
    below(frame, "● core", "› greeter");
    below(frame, "› greeter", "◆ hello thread");
    below(frame, "◆ hello thread", "◐ education");
    below(frame, "◐ education", "› drill");
    below(frame, "› drill", "· #t2");
    below(frame, "· #t2", "APPLICAT");
    below(frame, "APPLICAT", "› notes");
    specimen.expect(counted(frame, "› drill")).toBe(1);
    specimen.expect(counted(frame, "› notes")).toBe(1);
    view.setup.renderer.destroy();
  });

  specimen.it("a host's $status change repaints its pip", async () => {
    const view = await mounted("navigation");
    view.held.hosts.daemon.$status.set({ code: "UNAVAILABLE" });
    view.held.hosts.runtime.$status.set({ code: "RELEASED" });
    await settle(view.setup);
    specimen.expect(view.frame()).toContain("✕ education");
    specimen.expect(view.frame()).toContain("○ core");
    view.setup.renderer.destroy();
  });

  specimen.it("the active terminal's seated thread wears ◆", async () => {
    const view = await mounted("navigation");
    view.held.terminals.seated.$thread.set(view.held.threads.quiz);
    await settle(view.setup);
    specimen.expect(view.frame()).toContain("◆ #t2");
    specimen.expect(view.frame()).toContain("· hello thread");
    view.setup.renderer.destroy();
  });

  specimen.it("↓ and enter send terminal · mode · thread picks through client.dispatch", async () => {
    const view = await mounted("navigation");
    const step = async (downs) => {
      for (let index = 0; index < downs; index++) view.setup.mockInput.pressArrow("down");
      view.setup.mockInput.pressEnter();
      await settle(view.setup);
    };
    await step(1);
    await step(1);
    await step(1);
    await step(2);
    specimen.expect(view.held.dispatched).toEqual([
      "/terminal/k2",
      "/thread/new /runtime/core/mode/chat/greeter",
      "/thread/t1",
      "/thread/t2",
    ]);
    view.setup.renderer.destroy();
  });

  specimen.it("a thread created on the runtime appears under its mode", async () => {
    const view = await mounted("navigation");
    const fresh = { id: "t3", label: { name: "fresh", description: null, flags: [] }, mode: view.held.modes.greeter };
    view.held.client.runtime.entities.thread.$entities.set([...view.held.client.runtime.entities.thread.$entities.get(), fresh]);
    await settle(view.setup);
    below(view.frame(), "› greeter", "· fresh");
    below(view.frame(), "· fresh", "◐ education");
    view.setup.renderer.destroy();
  });
});

specimen.describe("before population — a pane mounts while client.runtime.entities is null", () => {});
