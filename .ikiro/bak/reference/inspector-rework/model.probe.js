import { Controller, Span, fromm, shape } from "@vivalence/typology";
import paladin, { factories, lifecycle } from "@vivalence/paladin";
import * as ghost from "@vivalence/ghost";
import { hello } from "@vivalence/ghost/scenarios";
import * as entities from "../../../systems/anima/src/surfaces/chrome/panels/telemetry/entities.js";
import * as spans from "../../../systems/anima/src/surfaces/chrome/panels/telemetry/spans.js";
import { form } from "./form.probe.js";

const said = (title, value, depth = 2) => console.log(`\n##### ${title}\n${form(value, depth)}`);
const wired = (title, value) => {
  try {
    console.log(`\n##### ${title} · JSON.stringify\n${JSON.stringify(value, null, 2)}`);
  } catch (error) {
    console.log(`\n##### ${title} · JSON.stringify THROWS\n${error.message.split("\n")[0]}`);
  }
};
const eventually = async (predicate, ms) => {
  const deadline = Date.now() + ms;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error(`timed out waiting ${ms}ms`);
    await new Promise((wake) => setTimeout(wake, 25));
  }
};
const leaf = (node, steps = []) => {
  for (const [nature, child] of Object.entries(node.branches)) {
    if ("effect" in child) return [...steps, nature];
    const below = leaf(child, [...steps, nature]);
    if (below !== null) return below;
  }
  return null;
};

const world = await hello.boot({ recipe: hello.DEMO, prefix: "viva-inspector-" });
console.log(`##### world · port ${world.port}`);
let clientDie = null;
try {
  paladin.assign(world.env, "flag");
  const instance = await factories.instance(lifecycle.paladin.instance(paladin));
  await paladin.ledger.registry.supply();
  const mask = instance.mask("ghost");
  const root = new Controller({ stdout: new Span("anima") });
  clientDie = await ghost.client.factory({ controller: root, mask, register: await paladin.ledger.registry.wire(mask), instance });
  const app = new ghost.app.App({ client: clientDie, controller: root.branch("app") });
  clientDie.app = app;

  
  const terminals = () => clientDie.runtime.entities.terminal.$entities.get();
  await eventually(() => clientDie.runtime !== null && terminals()[0] !== undefined && terminals()[0].thread !== null, 30000);
  const terminal = terminals()[0];
  await terminal.repl.dispatch("/mode srs/memo");
  const thread = terminal.thread;
  await terminal.repl.dispatch("ciao");
  await eventually(() => thread.$turns.get().filter((turn) => turn.createdAt !== undefined).length >= 2, 30000);
  await terminal.repl.dispatch("lookup please --tool srs/lookup --deltas 3");
  await eventually(() => thread.$turns.get().filter((turn) => turn.createdAt !== undefined).length >= 4, 30000);
  await terminal.repl.dispatch("/nonsense").catch(() => {});
  const seen = {
    app,
    terminal,
    terminals: terminals(),
    thread: terminal.thread,
    seated: terminal.buffer,
    turns: terminal.thread.$turns.get(),
    buffers: terminal.thread.$buffers.get(),
    activities: terminal.thread.$activities.get(),
    modes: clientDie.runtime.entities.mode.$entities.get(),
    daemons: clientDie.runtime.entities.daemon.$entities.get(),
  };
  const started = performance.now();
  const index = entities.indexed(entities.tree(seen));
  console.log(`##### tree built in ${(performance.now() - started).toFixed(1)}ms · ${index.held.length} nodes`);
  for (const { node, lineage } of index.held) if (lineage.length < 4 || node.kind !== "branch") console.log(`${"  ".repeat(lineage.length)}${node.kind} ${node.name} · ${node.quiet} · keys ${node.keys.join(",")} · ${node.secs.map(([l, r]) => `${l}:${r.length}`).join(" ")}`);
  console.log("##### lenses", JSON.stringify(entities.lenses(index, "tree")));
  for (const id of ["thread", "terminal", "harness", "bridge", "lighthouse"]) console.log(`##### picked ${id}\n${JSON.stringify(entities.picked(index, id), (k, v) => (v instanceof Set ? [...v] : v), 1).slice(0, 2500)}`);
  const list = spans.spans({ records: app.telemetry.$logger.get(), activities: clientDie.runtime.entities.activity.$entities.get(), since: 0, now: performance.timeOrigin + performance.now() });
  console.log(`##### spans ${list.length}`);
  for (const span of list) console.log(`${span.kind} ${span.id.slice(0, 90)} · ${span.code} · keys ${[...span.keys].join(",").slice(0, 120)}`);
  for (const id of ["thread", "terminal", "lighthouse", "app"]) {
    const held = spans.traced({ list, node: entities.picked(index, id), only: "all", selection: null });
    console.log(`##### traced ${id}: all ${held.all} faults ${held.faults} · ${held.rows.map((r) => `${"·".repeat(r.depth)}${r.name}`).join(" | ")}`);
  }
  const logged = spans.logger({ list, filter: "all", selection: list.filter((span) => span.fault !== null).map((span) => span.id)[0] });
  console.log("##### logger filters", JSON.stringify(logged.filters), "faults", logged.faults);
  console.log("##### detail", JSON.stringify(logged.detail, null, 1).slice(0, 1500));
} finally {
  if (clientDie !== null) {
    clientDie.controller.kill("SIGTERM", "probe over");
    await clientDie.controller.settled;
  }
  await world.stop();
}
Deno.exit(0);
