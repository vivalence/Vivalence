import { atom, computed } from "nanostores";
import { Controller, Path, Span, Vector, control, shape, shard, specimen, steer } from "@vivalence/typology";
import { accio } from "@vivalence/runtime/scenarios";
import * as ghost from "@vivalence/ghost";

const { modes } = ghost.client.lifecycle;
const execution = new Vector().use(shard.controller.open).use(modes).do(shard.controller.hold);

Deno.stdin.isTerminal = () => false;

const seated = async (clientDie) => {
  await control.controlled(clientDie.controller);
  clientDie.runtime = { entities: { mode: { $entities: atom([]) } } };
  return Object.assign(new ghost.terminal.Terminal(), { id: "t1", index: 0, client: clientDie, runtime: clientDie.runtime, controller: clientDie.controller.branch("terminal/t1") });
};

specimen.describe("a hosted mode lends its commands to the terminal's repl — REPLING, read at every dispatch", () => {
  const mask = { manifest: { type: "client", slug: "ghost", traits: [] }, reference: new Path("/client/ghost"), modes: [] };
  const root = new Controller({ stdout: new Span("ghost") });
  const clientDie = new ghost.client.Client({ controller: root.branch("client"), mask, register: null, instance: null });
  const tail = computed(clientDie.controller.stdout.$history, (held) => held.filter((record) => ["log", "fault"].includes(record.track)));

  specimen.it("/hello answers from @commons/home/console; /help lists hello and whoami beside the client's commands", async () => {
    clientDie.register = { modes: [await accio({ module: "@commons/home/console", reference: new Path("/mode/home/console") })] };
    const held = steer.dispatch.execute(execution, clientDie);
    const terminal = await seated(clientDie);
    await terminal.repl.dispatch("/hello");
    specimen.expect(tail.get().at(-1).data).toBe("hello from ghost");
    await terminal.repl.dispatch("/help");
    specimen.expect(Object.keys(tail.get().at(-1).data.branches).slice(0, 6)).toEqual(["doctor", "help", "lighthouse", "runtime", "hello", "whoami"]);
    clientDie.controller.kill("SIGTERM", "test over");
    await held;
  });
});

specimen.describe("a KEYMAPPED client mode lends its keys — legend.keymap grafts them at the root beside the harvest of the repl's chords", () => {
  const mask = { manifest: { type: "client", slug: "ghost", traits: [] }, reference: new Path("/client/ghost"), modes: [] };
  const root = new Controller({ stdout: new Span("ghost") });
  const clientDie = new ghost.client.Client({ controller: root.branch("client"), mask, register: null, instance: null });

  specimen.it("leader/h sits beside the repl's chords in legend.keymap; leader h on the terminal dispatches /hello", async () => {
    clientDie.register = { modes: [await accio({ module: "@commons/home/console", reference: new Path("/mode/home/console") })] };
    const held = steer.dispatch.execute(execution, clientDie);
    const terminal = await seated(clientDie);
    const leader = shape.strip(terminal.legend.keymap).branches.leader.branches;
    specimen.expect(Object.keys(leader)).toEqual(specimen.expect.arrayContaining(["h"]));
    specimen.expect(Object.keys(leader)).not.toContain("q");
    specimen.expect(leader.h.effect).toEqual({ valence: "hello. Example: ctrl-v h" });
    terminal.legend.dispatch("leader");
    terminal.legend.dispatch("h");
    await new Promise((wake) => setTimeout(wake, 50));
    specimen.expect(clientDie.controller.stdout.history.filter((record) => ["stop"].includes(record.track)).map((record) => record.path)).toContainEqual(["ghost", "client", "terminal/t1", "/hello"]);
    specimen.expect(clientDie.controller.stdout.history.filter((record) => ["fault"].includes(record.track))).toEqual([]);
    clientDie.controller.kill("SIGTERM", "test over");
    await held;
  });
});
