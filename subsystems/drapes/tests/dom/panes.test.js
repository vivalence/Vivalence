import { specimen } from "@vivalence/typology";
import { mime } from "@vivalence/typology";
import { document, fire, fresh, settle, surface, THEMES, words, world } from "./rig.js";

const PANES = ["signin", "crown", "dock", "frame", "navigation"];

const LAYOUT = {
  panes: PANES,
  dock: { side: "right", vertical: true, share: 0.32, direction: "row", dimension: 1000, size: 320, full: false, collapsed: false },
  buffer: true,
};

const mounted = async (pane, adjust = () => {}, theme = "northsea") => {
  const module = await surface;
  const { root } = fresh();
  const bag = module.dom(root, { credentials: null, theme });
  const held = world();
  adjust(held);
  const handle = bag.mount[pane](held.client);
  return { module, root, bag, held, sent: held.sent, handle, region: root.querySelector(`[data-pane=${pane}]`) };
};

const buttons = (element, label) => [...element.querySelectorAll("button")].filter((button) => words(button) === label);

const rows = (element, text) => [...element.querySelectorAll(".kit-row-click")].filter((row) => words(row).includes(text));

specimen.describe("dom panes — each mounts alone over a stub client in every dapper theme", () => {
  for (const theme of THEMES) {
    for (const pane of PANES) {
      specimen.it(`${pane} mounts, places and destroys under ${theme}`, async () => {
        const { root, handle, region } = await mounted(pane, (held) => held.terminal.$buffer.set({ id: "buffer-1", bundle: null, data: { theme } }), theme);
        handle.place(LAYOUT);
        specimen.expect(document.documentElement.getAttribute("data-theme")).toBe(theme);
        specimen.expect(root.getAttribute("data-zone")).toBe("1");
        specimen.expect(region.hidden).toBe(false);
        specimen.expect(words(region).length > 0).toBe(true);
        specimen.expect(root.querySelectorAll("[disabled]").length).toBe(0);
        handle.destroy();
        specimen.expect(region.childNodes.length).toBe(0);
        specimen.expect(region.hidden).toBe(true);
      });
    }
  }

  specimen.it("the sheet lands once in the head however many panes mount", async () => {
    const module = await surface;
    const { root } = fresh();
    const bag = module.dom(root, { credentials: null });
    const { client } = world();
    bag.mount.crown(client);
    bag.mount.dock(client);
    specimen.expect(document.head.querySelectorAll("style[data-drapes-dom]").length).toBe(1);
    specimen.expect(root.querySelectorAll(".chassis-root").length).toBe(1);
  });

  specimen.it("a pane mounted twice is loud", async () => {
    const { bag, held } = await mounted("crown");
    specimen.expect(() => bag.mount.crown(held.client)).toThrow(/crown is mounted already/);
  });
});

specimen.describe("dom crown — ✦ instance · user · daemon › mode · streaming", () => {
  specimen.it("shows the instance, the user and the daemon › mode slugs of the active thread", async () => {
    const { region } = await mounted("crown");
    specimen.expect(words(region)).toBe("✦ hello-world · beef · runtime › chat");
  });

  specimen.it("names the daemon that holds a daemon mode", async () => {
    const { region, held } = await mounted("crown");
    held.terminal.$thread.set(held.other);
    specimen.expect(words(region)).toBe("✦ hello-world · beef · education › reader");
  });

  specimen.it("streams while live is non-null and says offline on OFFLINE", async () => {
    const { region, held } = await mounted("crown");
    held.thread.$live.set({ open: null, turns: [] });
    specimen.expect(words(region).endsWith("· streaming")).toBe(true);
    held.thread.$live.set(null);
    held.lighthouse.$status.set({ code: "OFFLINE" });
    specimen.expect(words(region)).toBe("✦ hello-world · beef · runtime › chat offline");
  });

  specimen.it("drops the mode segment without a thread and the user when signed out", async () => {
    const { region, held } = await mounted("crown");
    held.terminal.$thread.set(null);
    held.lighthouse.$user.set({});
    specimen.expect(words(region)).toBe("✦ hello-world");
  });
});

specimen.describe("dom signin — username · password · sign in, sign up only on a JOINABLE lighthouse", () => {
  specimen.it("offers no sign up behind a lighthouse without JOINABLE", async () => {
    const { region } = await mounted("signin");
    specimen.expect(buttons(region, "sign in").length).toBe(1);
    specimen.expect(buttons(region, "sign up").length).toBe(0);
    specimen.expect(region.querySelectorAll("input").length).toBe(2);
  });

  specimen.it("logs in through the lighthouse with the typed credentials on submit", async () => {
    const { region, held } = await mounted("signin");
    region.querySelector("input[name=username]").value = "beef";
    region.querySelector("input[name=password]").value = "hunter22";
    const event = fire(region.querySelector("form"), "submit");
    specimen.expect(event.defaultPrevented).toBe(true);
    specimen.expect(held.accessed).toEqual([{ route: "/lighthouse/login", username: "beef", password: "hunter22" }]);
  });

  specimen.it("a JOINABLE lighthouse shows sign up, which signs up", async () => {
    const { region, held } = await mounted("signin", (world) => (world.lighthouse.manifest.traits = ["JOINABLE"]));
    region.querySelector("input[name=username]").value = "newcomer";
    region.querySelector("input[name=password]").value = "correct horse";
    fire(buttons(region, "sign up")[0], "click");
    specimen.expect(held.accessed).toEqual([{ route: "/lighthouse/signup", username: "newcomer", password: "correct horse" }]);
  });

  specimen.it("shows the lighthouse status's message", async () => {
    const { region, held } = await mounted("signin");
    specimen.expect(region.querySelectorAll(".signin-message").length).toBe(0);
    held.lighthouse.$status.set({ code: "ERROR", message: "invalid credentials" });
    specimen.expect(words(region.querySelector(".signin-message"))).toBe("invalid credentials");
  });
});

specimen.describe("dom reading — the lighthouse codes", () => {
  specimen.it("a status outside the twelve codes is loud", async () => {
    const { module } = await mounted("crown");
    specimen.expect(() => module.panes.reading.standing("SLEEPING")).toThrow(/not a lighthouse standing/);
  });
});

specimen.describe("dom dock — transcript, live turn, echo, output, composer", () => {
  const turns = (region) => [...region.querySelectorAll(".dock-turn")].map((turn) => [turn.getAttribute("data-phase"), words(turn)]);

  specimen.it("lists the thread's turns in order, then the echo, then the live turn", async () => {
    const { region, held } = await mounted("dock");
    held.thread.$echo.set({ role: "user", parts: [{ type: "text", text: "e tu?" }] });
    held.thread.$live.set({ open: { role: "assistant", parts: [{ type: "text", text: "anch" }] }, turns: [] });
    specimen.expect(turns(region)).toEqual([
      ["kept", "user ciao, come stai?"],
      ["kept", "assistant bene , grazie"],
      ["echo", "user e tu?"],
      ["live", "assistant anch"],
    ]);
    specimen.expect(region.querySelector('[data-role="assistant"] strong').textContent).toBe("bene");
  });

  specimen.it("follows a turn landing on the active thread and a thread switch", async () => {
    const { region, held } = await mounted("dock");
    held.thread.$turns.set([...held.thread.$turns.get(), { role: "user", parts: [{ type: "text", text: "terzo" }] }]);
    specimen.expect(turns(region).length).toBe(3);
    held.terminal.$thread.set(held.other);
    specimen.expect(turns(region)).toEqual([]);
  });

  specimen.it("has one textarea, no input, and enter dispatches the line while shift-enter and blanks do not", async () => {
    const { region, sent } = await mounted("dock");
    specimen.expect([region.querySelectorAll("textarea").length, region.querySelectorAll("input").length]).toEqual([1, 0]);
    const field = region.querySelector("textarea");
    field.value = "come si dice cat?";
    fire(field, "keydown", { key: "Enter", shiftKey: true });
    field.value = "   ";
    fire(field, "keydown", { key: "Enter" });
    field.value = "/help";
    const event = fire(field, "keydown", { key: "Enter" });
    specimen.expect(event.defaultPrevented).toBe(true);
    specimen.expect(sent).toEqual(["/help"]);
    specimen.expect(field.value).toBe("");
  });

  specimen.it("paints the surface's output by its shape: which · fault · refused · pick · else a JSON tree", async () => {
    const { region, bag, sent } = await mounted("dock");
    bag.emit("output", { which: [{ key: "ctrl-t", valence: "terminal" }, { key: "ctrl-o", valence: "mode" }] });
    specimen.expect(words(region.querySelector(".dock-slot"))).toBe("ctrl-t terminal ctrl-o mode");
    bag.emit("output", { fault: "no such command /hepl" });
    specimen.expect(words(region.querySelector(".dock-slot"))).toBe("fault no such command /hepl");
    bag.emit("output", { refused: "not authorized" });
    specimen.expect(words(region.querySelector(".dock-slot"))).toBe("refused not authorized");
    bag.emit("output", { pick: ["/mode/chat", "/mode/reader"] });
    fire(rows(region.querySelector(".dock-slot"), "/mode/reader")[0], "click");
    specimen.expect(sent).toEqual(["/mode/reader"]);
    bag.emit("output", { instance: "hello-world", ports: [2501] });
    specimen.expect(region.querySelectorAll(".dock-slot .kit-json-node").length > 0).toBe(true);
  });

  specimen.it("says no thread when the active terminal holds none", async () => {
    const { region } = await mounted("dock", (held) => held.terminal.$thread.set(null));
    specimen.expect(words(region.querySelector(".dock-transcript"))).toBe("no thread pick a mode in navigation · or a thread");
  });
});

specimen.describe("dom navigation — runtime › daemon › mode › thread, terminals as tabs", () => {
  const named = (element) => {
    if (element.hasAttribute("data-daemon")) return `daemon:${element.getAttribute("data-daemon")}`;
    if (element.hasAttribute("data-mode")) return `mode:${element.getAttribute("data-mode")}`;
    return `thread:${words(element)}`;
  };
  const order = (region) => [...region.querySelectorAll("[data-daemon], [data-mode], .navigation-thread")].map(named);

  specimen.it("lists the runtime first, its modes, then the daemon and its modes by trait, the active thread's mode open", async () => {
    const { region } = await mounted("navigation");
    specimen.expect(order(region)).toEqual(["daemon:runtime", "mode:chat", "thread:first words", "daemon:education", "mode:reader", "mode:scout"]);
    specimen.expect([...region.querySelectorAll(".navigation-trait")].map(words)).toEqual(["HARNESSED", "APPLICATION · HARNESSED", "TOOLING"]);
    specimen.expect([...region.querySelectorAll("[data-daemon] .kit-pip")].map((pip) => pip.getAttribute("data-tone"))).toEqual(["success", "warning"]);
  });

  specimen.it("picks a thread, opens a mode and starts a thread in it", async () => {
    const { region, sent } = await mounted("navigation");
    fire(rows(region, "first words")[0], "click");
    fire(rows(region.querySelector('[data-mode="reader"]'), "reader mode")[0], "click");
    specimen.expect(order(region).includes("thread:reading notes")).toBe(true);
    fire(rows(region.querySelector('[data-mode="reader"]'), "new thread")[0], "click");
    specimen.expect(sent).toEqual(["/thread/thread-1", "/thread/new /daemon/education/mode/editor/reader"]);
  });

  specimen.it("tabs the terminals, latches the active one and picks another", async () => {
    const { region, sent } = await mounted("navigation");
    const strip = region.querySelector(".kit-strip");
    specimen.expect([...strip.querySelectorAll("button")].map((button) => [words(button), button.classList.contains("kit-button-latched")])).toEqual([
      ["terminal 1", true],
      ["terminal 2", false],
    ]);
    fire(buttons(strip, "terminal 2")[0], "click");
    specimen.expect(sent).toEqual(["/terminal/terminal-2"]);
  });

  specimen.it("folds to its toggle and unfolds", async () => {
    const { region } = await mounted("navigation");
    fire(buttons(region, "«")[0], "click");
    specimen.expect([region.querySelectorAll("[data-daemon]").length, words(region)]).toEqual([0, "»"]);
    fire(buttons(region, "»")[0], "click");
    specimen.expect(region.querySelectorAll("[data-daemon]").length).toBe(2);
  });

  specimen.it("picks up a daemon's modes when they land", async () => {
    const { region, held } = await mounted("navigation", (world) => world.education.$modes.set([]));
    specimen.expect(region.querySelectorAll('[data-daemon="education"] [data-mode]').length).toBe(0);
    held.education.$modes.set([held.modes.scout]);
    specimen.expect(region.querySelectorAll('[data-daemon="education"] [data-mode]').length).toBe(1);
  });

  specimen.it("lists the runtime alone and each daemon once its row lands", async () => {
    const { region, held } = await mounted("navigation", (world) => world.runtime.entities.daemon.$entities.set([]));
    const listed = () => [...region.querySelectorAll("[data-daemon]")].map((section) => section.getAttribute("data-daemon"));
    specimen.expect(listed()).toEqual(["runtime"]);
    held.runtime.entities.daemon.$entities.set([held.education]);
    specimen.expect(listed()).toEqual(["runtime", "education"]);
  });
});

specimen.describe("dom frame — the seated terminal's buffer, its bundle or the JSON floor", () => {
  const offering = (entries, module) => ({
    negotiate: (accept) => accept.map((type) => entries.find((entry) => entry.mime === type)).find((entry) => entry !== undefined) ?? null,
    load: () => module(),
  });

  specimen.it("falls through to the mime.json floor when the buffer has no bundle, and closes", async () => {
    const { region, held, sent } = await mounted("frame");
    held.terminal.$buffer.set({ id: "buffer-1", bundle: null, data: { lemma: "gatto", gloss: "cat" } });
    specimen.expect(region.querySelector(".frame-floor").getAttribute("data-floor")).toBe(mime.json);
    specimen.expect(words(region.querySelector(".frame-floor")).includes('lemma : "gatto"')).toBe(true);
    fire(buttons(region, "×")[0], "click");
    specimen.expect(sent).toEqual(["/buffer/close"]);
  });

  specimen.it("falls through to the floor when the bundle offers no module the surface accepts", async () => {
    const { region, held } = await mounted("frame");
    held.terminal.$buffer.set({ id: "buffer-2", bundle: offering([{ mime: mime.tty.solid }], () => Promise.reject(new Error("never"))), data: { rows: 3 } });
    specimen.expect(region.querySelectorAll(".frame-floor").length).toBe(1);
  });

  specimen.it("mounts the bundle's default into the stage with { buffer, dispatch } and destroys it on change", async () => {
    const { region, held, sent } = await mounted("frame");
    const log = [];
    const module = {
      default: (element, props) => {
        element.textContent = `view of ${props.buffer.id}`;
        props.dispatch(`/buffer/ready ${props.buffer.id}`);
        log.push(`mount ${props.buffer.id}`);
        return { destroy: () => log.push(`destroy ${props.buffer.id}`) };
      },
    };
    const buffer = { id: "buffer-3", bundle: offering([{ mime: mime.dom.solid }], () => Promise.resolve(module)), data: {} };
    held.terminal.$buffer.set(buffer);
    specimen.expect(words(region.querySelector(".frame-body"))).toBe("loading bundle buffer buffer-3");
    await settle();
    specimen.expect(words(region.querySelector(".frame-stage"))).toBe("view of buffer-3");
    specimen.expect(sent).toEqual(["/buffer/ready buffer-3"]);
    held.terminal.$buffer.set(null);
    specimen.expect(log).toEqual(["mount buffer-3", "destroy buffer-3"]);
    specimen.expect(words(region.querySelector(".frame-body"))).toBe("no buffer open one from a thread");
  });

  specimen.it("says bundle refused when the load fails", async () => {
    const { region, held } = await mounted("frame");
    const refusing = offering([{ mime: mime.dom.svelte }], () => Promise.reject(new Error("integrity sha256 0000 is not 1111")));
    held.terminal.$buffer.set({ id: "buffer-4", bundle: refusing, data: {} });
    await settle();
    specimen.expect(words(region.querySelector(".frame-body"))).toBe("bundle refused integrity sha256 0000 is not 1111");
  });
});
