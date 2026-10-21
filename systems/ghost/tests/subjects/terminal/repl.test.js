import { atom, computed } from "nanostores";
import { Controller, Path, Span, Vector, control, shape, shard, specimen, steer } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";

const { modes } = ghost.client.lifecycle;
const execution = new Vector().use(shard.controller.open).use(modes).do(shard.controller.hold);

const tracks = (tail) => tail.get().map((record) => record.track);
const tracked = (span, ...names) => computed(span.$history, (held) => held.filter((record) => names.includes(record.track)));
const natures = (node, steps = []) => [
  ...(node.effect === undefined ? [] : ["/" + steps.join("/")]),
  ...Object.entries(node.branches).flatMap(([key, child]) => natures(child, [...steps, key])),
];

const LAWFUL = ["/help", "/quit", "/modes", "/mode", "/*"];

const seated = async (client, id) => {
  await control.controlled(client.controller);
  return Object.assign(new ghost.terminal.Terminal(), { id, index: 0, client, runtime: client.runtime, controller: client.controller.branch(`terminal/${id}`) });
};

const on = (tty, read) => {
  const isTerminal = Deno.stdin.isTerminal;
  Deno.stdin.isTerminal = () => tty;
  try {
    return read();
  } finally {
    Deno.stdin.isTerminal = isTerminal;
  }
};

specimen.describe("repl — a line runs on the terminal's Repl; its records land on the client's span; the tail is what a surface paints", () => {
  const root = new Controller({ stdout: new Span("ghost") });
  const mask = { manifest: { type: "client", slug: "ghost", traits: [] }, reference: new Path("/client/ghost"), modes: [] };
  const client = new ghost.client.Client({ controller: root.branch("client"), mask, register: { modes: [] }, instance: null });
  const held = steer.dispatch.execute(execution, client);
  client.runtime = { entities: { mode: { $entities: atom([]) } } };
  const tail = tracked(client.controller.stdout, "log", "fault");
  let terminal = null;

  specimen.it("/help on a tty answers with the whole of terminal.repl.commands — the client's with the tty's /quit, the terminal's; no app, none of the app's", async () => {
    terminal = await seated(client, "t1");
    await on(true, () => terminal.repl.dispatch("/help"));
    specimen.expect(tracks(tail)).toEqual(["log"]);
    const listed = natures(tail.get().at(-1).data);
    specimen.expect(listed).toEqual([
      "/anima",
      "/anima/open",
      "/doctor",
      "/help",
      "/lighthouse",
      "/lighthouse/login",
      "/lighthouse/refresh",
      "/lighthouse/logout",
      "/quit",
      "/runtime",
      "/abort",
      "/activity",
      "/attach",
      "/buffer",
      "/buffer/close",
      "/buffer/full",
      "/cell/set",
      "/detach",
      "/dictate",
      "/dock",
      "/dock/lens",
      "/split",
      "/frame/set",
      "/tune",
      "/effort",
      "/rounds",
      "/leader",
      "/leader/leader",
      "/legend/close",
      "/modes",
      "/mode",
      "/pause",
      "/resume",
      "/set",
      "/stop",
      "/thread",
      "/thread/new",
      "/thread/label",
      "/*",
    ]);
    specimen.expect(listed).toEqual(specimen.expect.arrayContaining(LAWFUL));
    specimen.expect(tail.get().at(-1).data.branches.quit.effect.valence).toMatch(/Example: \/quit/);
    specimen.expect(tail.get().at(-1).path).toEqual(["ghost", "client", "terminal/t1", "/help"]);
  });

  specimen.it("a bare line on a terminal whose mode is not HARNESSED is NotFound — a fault on the line's branch /*", async () => {
    await terminal.repl.dispatch("ciao").catch(() => {});
    specimen.expect(tracks(tail)).toEqual(["log", "fault"]);
    specimen.expect(tail.get().at(-1).path).toEqual(["ghost", "client", "terminal/t1", "/*"]);
  });

  specimen.it("an unknown verb settles the line FAILED AND leaves a fault record", async () => {
    await terminal.repl.dispatch("/typo").catch(() => {});
    specimen.expect(tracks(tail)).toEqual(["log", "fault", "fault"]);
    specimen.expect(tail.get().at(-1).path).toEqual(["ghost", "client", "terminal/t1", "/typo"]);
  });

  specimen.it("a tail opened late replays the journal — a surface mounted after the fact sees everything", () => {
    specimen.expect(tracks(tracked(client.controller.stdout, "log", "fault"))).toEqual(tracks(tail));
    specimen.expect(tracks(tracked(client.controller.stdout, "fault"))).toEqual(["fault", "fault"]);
  });

  specimen.it("the attached mode's repl sits at the root of terminal.repl.commands, read at every dispatch: what its repl gains later answers too; detached, it is gone; no /mode/<type>/<slug> scope", async () => {
    const probe = { type: "home", slug: "probe", repl: new Vector().open({ nature: "/ping", valence: "the mode answers. Example: /ping" }, () => "pong") };
    terminal.$thread.set({ mode: probe, $buffers: atom([{ id: "b1" }]), $phase: atom("manual") });
    specimen.expect(await terminal.repl.dispatch("/ping")).toBe("pong");
    probe.repl.open({ nature: "/late", valence: "wired after the mode was attached. Example: /late" }, () => "late");
    specimen.expect(await terminal.repl.dispatch("/late")).toBe("late");
    specimen.expect(natures(shape.strip(terminal.repl.commands))).not.toContain("/mode/home/probe/ping");
    terminal.$thread.set(null);
    specimen.expect(natures(shape.strip(terminal.repl.commands))).not.toContain("/ping");
    specimen.expect(on(true, () => natures(shape.strip(terminal.repl.commands)))).toEqual(natures(tail.get().at(0).data));
  });

  specimen.it("off a tty terminal.repl.commands holds no /quit; everything else is the same", () => {
    specimen.expect(on(false, () => natures(shape.strip(terminal.repl.commands)))).toEqual(on(true, () => natures(shape.strip(terminal.repl.commands))).filter((nature) => nature !== "/quit"));
  });

  specimen.it("with an app the app's commands join terminal.repl.commands; the app gone, they are gone", () => {
    const headless = on(true, () => natures(shape.strip(terminal.repl.commands)));
    client.app = new ghost.app.App({ client });
    const shown = on(true, () => natures(shape.strip(terminal.repl.commands)));
    client.app = null;
    specimen.expect(shown.filter((nature) => !headless.includes(nature))).toEqual(["/filter", "/filter/close", "/filter/expand", "/filter/pick", "/filter/daemon", "/filter/trait", "/focus", "/popover", "/popover/close", "/repl", "/repl/close", "/repl/next", "/repl/previous", "/repl/complete", "/sidebar", "/sidebar/toggle", "/sidebar/width", "/telemetry", "/telemetry/clear", "/terminal", "/terminal/new", "/terminal/close", "/theme/set", "/widget/toggle/close", "/widget/toggle/sidebar", "/widget/toggle/entity", "/widget/toggle/display", "/widget/toggle/system", "/widget/toggle/dock", "/widgets/close"]);
    specimen.expect(on(true, () => natures(shape.strip(terminal.repl.commands)))).toEqual(headless);
  });

  specimen.it("/quit on a tty kills the client; the lifecycle unwinds and settles STOPPED", async () => {
    await on(true, () => terminal.repl.dispatch("/quit"));
    await held;
    await client.controller.settled;
    specimen.expect(client.controller.status.reflection.code).toBe("STOPPED");
  });
});

