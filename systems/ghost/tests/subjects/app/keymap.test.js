import { Vector, shape, specimen } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";

const settled = () => new Promise((wake) => setTimeout(wake, 0));

const seat = (commands) => {
  const client = {
    modes: {},
    app: { bridge: new ghost.app.Bridge() },
    dispatched: [],
    faults: [],
    controller: { stdout: { fault: (error) => client.faults.push(error.message) } },
  };
  const terminal = Object.assign(new ghost.terminal.Terminal(), { client, controller: { stdout: { log: () => undefined, fault: (error) => client.faults.push(error.message) } } });
  Object.defineProperty(terminal.repl, "commands", { get: () => commands });
  terminal.repl.dispatch = (line) => {
    client.dispatched.push(line);
    return Promise.resolve();
  };
  return terminal;
};
const press = (terminal, ...keys) => {
  for (const key of keys) terminal.legend.dispatch(key);
  return settled();
};
const commands = () => new Vector().open({ nature: "/mode", valence: "pick", chord: "leader/m" }, () => "picked").open({ nature: "/quit", valence: "leave" }, () => "left");

specimen.it("legend.keymap: the repl's chords, the app's keymap, the hosted modes' keymaps, then the thread mode's keymap at the root — later wins; read at every call", () => {
  const terminal = seat(new Vector().open({ nature: "/modes", valence: "list", chord: "leader/l" }, () => []));
  terminal.client.modes = { home: { console: { keymap: new Vector().open({ nature: "leader/m", valence: "the hosted mode's" }, "/mode") } } };
  specimen.expect(Object.keys(shape.strip(terminal.legend.keymap).branches.leader.branches)).toEqual(["l", "e", "a", "h", "d", "s", "w", "m"]);
  terminal.thread = { mode: { repl: new Vector(), keymap: new Vector().open({ nature: "leader/h", valence: "hello" }, "/hello").open({ nature: "leader/m", valence: "the mode's" }, "/modes") } };
  const stripped = shape.strip(terminal.legend.keymap).branches.leader.branches;
  specimen.expect(Object.keys(stripped)).toEqual(["l", "e", "a", "h", "d", "s", "w", "m"]);
  specimen.expect(stripped.m.effect).toEqual({ valence: "the mode's" });
  specimen.expect(stripped.h.effect).toEqual({ valence: "hello" });
  terminal.thread = { mode: "/daemon/elsewhere/mode/x/y" };
  specimen.expect(shape.strip(terminal.legend.keymap).branches.leader.branches.m.effect).toEqual({ valence: "the hosted mode's" });
});

specimen.it("the app's keymap declares its groups under leader with a valence; leader leader and esc are the repl's chords, never the keymap's", () => {
  const leader = shape.strip(ghost.app.keymap).branches.leader;
  specimen.expect(leader.meta).toEqual({ valence: "the leader — ctrl-v on a tty" });
  specimen.expect(Object.keys(leader.branches)).toEqual(["e", "a", "h", "d", "s", "w"]);
  specimen.expect(leader.branches.d.meta).toEqual({ valence: "display · how do I see it" });
  specimen.expect(Object.keys(shape.strip(ghost.app.keymap).branches)).toEqual(["leader"]);
  specimen.expect(shape.strip(ghost.app.closing).branches.leader.effect).toEqual({ valence: "/repl/close" });
});

specimen.it("leader m dispatches /mode; leader esc · leader x · q at the root drop silently", async () => {
  const terminal = seat(commands());
  await press(terminal, "leader", "m");
  specimen.expect(terminal.client.dispatched).toEqual(["/mode"]);
  await press(terminal, "leader", "esc", "leader", "x", "q");
  specimen.expect([terminal.client.dispatched, terminal.client.faults, terminal.legend.chord]).toEqual([["/mode"], [], null]);
});

specimen.it("a held node is painted on the legend's $chord — the stripped node — and cleared when the walk ends; leader leader dispatches /repl, its chord", async () => {
  const terminal = seat(commands().graft(ghost.app.commands.repl));
  terminal.legend.dispatch("leader");
  specimen.expect(terminal.legend.presses.backlog.map((signal) => signal.nature)).toEqual(["leader"]);
  specimen.expect(Object.keys(terminal.legend.chord.branches)).toEqual(["m", "leader", "e", "a", "h", "d", "s", "w"]);
  await press(terminal, "leader");
  specimen.expect([terminal.legend.chord, terminal.client.dispatched]).toEqual([null, ["/repl"]]);
});

specimen.it("KEYMAPPED binds a hosted mode's function effects to ctx.mode; the thread mode's keys walk on its terminal", async () => {
  const mode = { slug: "board", module: { keymap: new Vector().open({ nature: "leader/g/n", valence: "new game" }, (ctx) => (ctx.mode === mode ? "/game/new" : "/unbound")) }, keymap: new Vector(), repl: new Vector() };
  ghost.entities.mode.traits.KEYMAPPED(mode);
  const terminal = seat(commands());
  terminal.thread = { mode };
  await press(terminal, "leader", "g", "n");
  specimen.expect([terminal.client.dispatched, terminal.client.faults]).toEqual([["/game/new"], []]);
});
