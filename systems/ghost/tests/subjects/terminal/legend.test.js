import paladin from "@vivalence/paladin";
import { ReplSignal, Vector, specimen, steer } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";

const settled = () => new Promise((wake) => setTimeout(wake, 0));

const prevented = [];
const tty = (sequence, name, held = {}) => ({ sequence, name, ctrl: false, meta: false, shift: false, option: false, super: false, ...held, preventDefault: () => prevented.push(name) });
const ctrlV = tty("\x16", "v", { ctrl: true });

const seat = () => {
  const client = {
    modes: {},
    app: { bridge: new ghost.app.Bridge() },
    dispatched: [],
    faults: [],
    controller: { stdout: { fault: (error) => terminal.client.faults.push(error.message) } },
  };
  client.app.bridge.$focus.set("journal");
  const terminal = Object.assign(new ghost.terminal.Terminal(), { client, controller: { stdout: { log: () => undefined, fault: (error) => client.faults.push(error.message) } } });
  const commands = new Vector()
    .open({ nature: "/dock", valence: "the dock", chord: "leader/d/d" }, () => "docked")
    .open({ nature: "/boom", valence: "throws", chord: "leader/a/b" }, () => "boomed")
    .graft(ghost.app.commands.repl, ghost.terminal.commands.leader);
  Object.defineProperty(terminal.repl, "commands", { get: () => commands });
  terminal.repl.dispatch = (line) => {
    terminal.client.dispatched.push(line);
    return line === "/boom" ? Promise.reject(new Error("boom")) : steer.dispatch.execute(commands, { terminal, client: terminal.client }, new ReplSignal(line));
  };
  return terminal;
};

const held = (terminal) => terminal.legend.presses.backlog.map((signal) => signal.nature);

specimen.describe("the Legend — a press goes through translation into the queue; the queue walks its terminal's keymap", () => {
  specimen.it("ctrl-v holds the leader: the queue holds leader, $chord is its stripped node", () => {
    const terminal = seat();
    terminal.legend.dispatch(ctrlV);
    specimen.expect(held(terminal)).toEqual(["leader"]);
    specimen.expect(Object.keys(terminal.legend.chord.branches)).toEqual(["d", "a", "leader", "esc", "e", "h", "s", "w"]);
    specimen.expect(terminal.legend.chord.branches.e.meta).toEqual({ valence: "entity · where am I" });
  });

  specimen.it("ctrl-v d d runs /dock on its terminal; the queue flushes, $chord is null", async () => {
    const terminal = seat();
    for (const key of [ctrlV, "d", "d"]) terminal.legend.dispatch(key);
    await settled();
    specimen.expect(terminal.client.dispatched).toEqual(["/dock"]);
    specimen.expect([held(terminal), terminal.legend.chord]).toEqual([[], null]);
  });

  specimen.it("ctrl-v ctrl-v dispatches /repl, its chord: the catalog opens with / prefilled", async () => {
    const terminal = seat();
    for (const key of [ctrlV, ctrlV]) terminal.legend.dispatch(key);
    await settled();
    specimen.expect(terminal.client.dispatched).toEqual(["/repl"]);
    specimen.expect(terminal.repl.$catalog.get().map((entry) => entry.nature)).toEqual(["/dock", "/boom", "/repl", "/repl/close", "/repl/next", "/repl/previous", "/repl/complete", "/leader", "/leader/leader", "/legend/close"]);
    specimen.expect([terminal.client.app.bridge.draft, terminal.client.app.bridge.focus, terminal.legend.chord]).toEqual(["/", "composer", null]);
  });

  specimen.it("the leader cycles: ctrl-v the legend, ctrl-v the repl, ctrl-v closed, ctrl-v the legend again", async () => {
    const terminal = seat();
    const shown = () => [terminal.legend.chord === null ? null : "legend", terminal.repl.catalog === null ? null : "repl"];
    terminal.legend.dispatch(ctrlV);
    specimen.expect(shown()).toEqual(["legend", null]);
    terminal.legend.dispatch(ctrlV);
    await settled();
    specimen.expect(shown()).toEqual([null, "repl"]);
    terminal.legend.dispatch(ctrlV);
    await settled();
    specimen.expect([shown(), held(terminal), terminal.client.faults, terminal.client.dispatched]).toEqual([[null, null], [], [], ["/repl", "/repl/close"]]);
    terminal.legend.dispatch(ctrlV);
    specimen.expect(shown()).toEqual(["legend", null]);
  });

  specimen.it("ctrl-v esc dispatches /legend/close, its chord: flushed; esc at the root dispatches /repl/close: the catalog drops", async () => {
    const terminal = seat();
    for (const key of [ctrlV, "esc"]) terminal.legend.dispatch(key);
    await settled();
    specimen.expect([held(terminal), terminal.legend.chord, terminal.client.dispatched]).toEqual([[], null, ["/legend/close"]]);
    terminal.repl.$catalog.set([]);
    terminal.legend.dispatch("esc");
    await settled();
    specimen.expect([terminal.repl.$catalog.get(), terminal.client.dispatched]).toEqual([null, ["/legend/close", "/repl/close"]]);
  });

  specimen.it("with the repl open, up · down · tab dispatch /repl/previous · /repl/next · /repl/complete; closed, they are dead ends", async () => {
    const terminal = seat();
    for (const key of ["down", "up", "tab"]) terminal.legend.dispatch(key);
    await settled();
    specimen.expect(terminal.client.dispatched).toEqual([]);
    terminal.repl.$catalog.set([]);
    for (const key of ["down", "up", "tab"]) terminal.legend.dispatch(key);
    await settled();
    specimen.expect(terminal.client.dispatched).toEqual(["/repl/next", "/repl/previous", "/repl/complete"]);
  });

  specimen.it("d at the root is a dead end, then ctrl-v holds a fresh leader", () => {
    const terminal = seat();
    terminal.legend.dispatch("d");
    specimen.expect(held(terminal)).toEqual([]);
    terminal.legend.dispatch(ctrlV);
    specimen.expect(held(terminal)).toEqual(["leader"]);
  });

  specimen.it("a key effect that throws lands on the client's stdout as a fault", async () => {
    const terminal = seat();
    for (const key of [ctrlV, "a", "b"]) terminal.legend.dispatch(key);
    await settled();
    specimen.expect(terminal.client.faults).toEqual(["boom"]);
  });

  specimen.it("a key pressed while a chord is held prevents its default — it never falls through to the focused input; a key with nothing held does not", () => {
    const terminal = seat();
    prevented.length = 0;
    terminal.legend.dispatch(tty("x", "x"));
    specimen.expect(prevented).toEqual([]);
    terminal.legend.dispatch(ctrlV);
    terminal.legend.dispatch(tty("d", "d"));
    specimen.expect([held(terminal), prevented]).toEqual([["leader", "d"], ["v", "d"]]);
    terminal.legend.flush();
  });

  specimen.it("the leader key prevents the event's default; in a browser off Apple it is meta-v, and ctrl-v is the paste's", () => {
    const terminal = seat();
    prevented.length = 0;
    terminal.legend.dispatch(ctrlV);
    specimen.expect([held(terminal), prevented]).toEqual([["leader"], ["v"]]);
    terminal.legend.flush();
    const is = Object.getOwnPropertyDescriptors(paladin.is);
    Object.defineProperty(paladin.is, "browser", { get: () => true, configurable: true });
    Object.defineProperty(paladin.is, "apple", { get: () => false, configurable: true });
    try {
      terminal.legend.dispatch(tty("v", "v", { super: true }));
      specimen.expect(held(terminal)).toEqual(["leader"]);
      terminal.legend.flush();
      terminal.legend.dispatch(ctrlV);
      specimen.expect(held(terminal)).toEqual([]);
    } finally {
      Object.defineProperty(paladin.is, "browser", is.browser);
      Object.defineProperty(paladin.is, "apple", is.apple);
    }
  });
});
