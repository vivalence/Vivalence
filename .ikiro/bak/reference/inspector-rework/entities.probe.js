import { Controller, Span, fromm, shape } from "@vivalence/typology";
import paladin, { factories, lifecycle } from "@vivalence/paladin";
import * as ghost from "@vivalence/ghost";
import { hello } from "@vivalence/ghost/scenarios";
import * as sections from "../../../systems/anima/src/surfaces/chrome/panels/sidebar/sections.js";
import * as trees from "../../../systems/anima/src/surfaces/chrome/panels/telemetry/trees.js";
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

  const seen = [];
  clientDie.runtime.entities.activity.$entities.listen((activities) => {
    for (const activity of activities)
      seen.push({ form: form(activity, 1), json: JSON.stringify(activity, null, 2), status: activity.status, steps: activity.steps.length, error: activity.controller.status.reflection.error });
  });

  said("HOME thread before /mode (terminal.thread)", terminal.thread, 1);
  await terminal.repl.dispatch("/mode srs/memo");
  const thread = terminal.thread;
  await terminal.repl.dispatch("ciao");
  await eventually(() => thread.$turns.get().filter((turn) => turn.createdAt !== undefined).length >= 2, 30000);
  await terminal.repl.dispatch("lookup please --tool srs/lookup --deltas 3");
  await eventually(() => thread.$turns.get().filter((turn) => turn.createdAt !== undefined).length >= 4, 30000);
  await terminal.repl.dispatch("break --fault fatal").catch(() => {});
  await new Promise((wake) => setTimeout(wake, 800));
  await terminal.repl.dispatch("/modes");
  await terminal.repl.dispatch("/nonsense").catch(() => {});
  const memo = terminal.mode;
  const buffer = await clientDie.runtime.entities.buffer.create({ mode: memo.id, thread: thread.id, data: {} });
  await terminal.setBuffer(buffer);
  await eventually(() => terminal.buffer !== null, 10000);
  await new Promise((wake) => setTimeout(wake, 300));

  said("app", app, 1);
  said("app.bridge", app.bridge, 1);
  said("app.telemetry", app.telemetry, 1);
  said("app.client", clientDie, 1);
  said("app.client.mask", clientDie.mask, 3);
  said("terminal", terminal, 1);
  wired("terminal", terminal);
  said("terminals", terminals(), 0);
  said("thread", thread, 1);
  wired("thread", thread);
  said("thread.trait", thread.trait, 3);
  const turns = thread.$turns.get();
  turns.forEach((turn, index) => said(`turns[${index}]`, turn, 0));
  turns.forEach((turn, index) => said(`turns[${index}] .parts · .meta · .parent`, { parts: turn.parts, meta: turn.meta, parent: turn.parent === null ? null : turn.parent.id }, 6));
  wired("turns[0]", turns[0]);
  said("buffers", thread.$buffers.get(), 1);
  wired("buffers", thread.$buffers.get());
  said("seated", terminal.buffer, 1);
  said("seated .trait · .label · named(seated)", { trait: terminal.buffer.trait, label: terminal.buffer.label, named: sections.named(terminal.buffer) }, 3);
  said("thread.mode", memo, 1);
  said("thread.mode.metadata.aperture", memo.metadata.aperture, 4);
  wired("thread.mode", memo);
  said("lighthouse", clientDie.runtime.lighthouse, 2);
  said("runtime", clientDie.runtime, 1);
  said("runtime.metadata", clientDie.runtime.metadata, 4);
  const daemons = clientDie.runtime.entities.daemon.$entities.get();
  said("daemons", daemons, 1);
  said("daemon memo .metadata · .mask", { metadata: daemons[1].metadata, mask: daemons[1].mask }, 4);
  wired("daemons", daemons);
  const modes = clientDie.runtime.entities.mode.$entities.get();
  said("modes", modes.map((mode) => ({ reference: mode.reference.absolute, daemon: mode.daemon === null ? null : mode.daemon.slug, manifest: mode.manifest, metadata: Object.keys(mode.metadata) })), 3);
  wired("modes", modes);
  const locals = fromm.modes(clientDie.modes).flat;
  said("locals", locals, 1);
  said("harness(runtime, thread)", sections.harness(clientDie.runtime, thread), 3);
  const harness = memo.metadata.harness;
  said("memo.metadata.harness · top", Object.fromEntries(Object.entries(harness).map(([key, node]) => [key, Object.keys(node.branches)])), 2);
  console.log(`\n##### memo.metadata.harness.primer · JSON.stringify\n${JSON.stringify(harness.primer, null, 2)}`);
  console.log(`\n##### memo.metadata.harness.tools.branches.grade · JSON.stringify\n${JSON.stringify(harness.tools.branches.grade, null, 2)}`);
  console.log(`\n##### memo.metadata.harness.tools.branches.srs.branches.lookup · JSON.stringify\n${JSON.stringify(harness.tools.branches.srs.branches.lookup, null, 2)}`);
  console.log(`\n##### memo.metadata.harness.references.branches.choice · JSON.stringify\n${JSON.stringify(harness.references.branches.choice, null, 2)}`);
  const primer = leaf(memo.metadata.harness.primer);
  const text = await memo.connection.call(`/metadata/harness/primer/${primer.join("/")}`, { thread: thread.id }).catch((error) => `FAULT ${error.message}`);
  said(`peek /metadata/harness/primer/${primer.join("/")}`, text, 1);
  const strip = shape.strip(terminal.repl.commands);
  said("shape.strip(terminal.repl.commands) · top", Object.keys(strip.branches), 1);
  for (const key of ["telemetry", "mode", "tier", "*"])
    console.log(`\n##### shape.strip(terminal.repl.commands).branches["${key}"] · JSON.stringify\n${JSON.stringify(strip.branches[key], null, 2)}`);
  const records = clientDie.controller.stdout.history;
  said("records count by track", Object.fromEntries(Object.entries(Object.groupBy(records, (record) => record.track)).map(([track, held]) => [track, held.length])), 1);
  console.log(`\n##### records · JSON.stringify\n${JSON.stringify(records, null, 2)}`);
  said("activity statuses seen", seen.map((held) => `${held.status}:${held.steps}`), 1);
  const running = seen.find((held) => held.status === "RUNNING");
  console.log(`\n##### activity RUNNING · form\n${running.form}`);
  for (const held of seen.filter((candidate, index, all) => all.findIndex((other) => other.json === candidate.json) === index && ["DONE", "FAILED"].includes(candidate.status)))
    console.log(`\n##### activity ${held.status} (${held.steps} steps) · JSON.stringify\n${held.json}\n##### its controller.status.reflection.error\n${form(held.error, 2)}`);
  said("thread.activities now", thread.activities, 1);
  const tree = trees.modes({ runtime: clientDie.runtime, daemons, modes, locals, seated: memo });
  console.log(`\n##### trees.modes(…) · JSON.stringify (first host, first mode)\n${JSON.stringify({ ...tree[0], children: tree[0].children.slice(0, 1) }, null, 2)}`);
  const harnesses = trees.harnesses({ modes, seated: memo, minded: "thread memo", looped: strip });
  said("trees.harnesses(…) ids", harnesses.map((held) => [held.id, held.children.map((child) => `${child.label}:${child.tag}`)]), 2);
} finally {
  if (clientDie !== null) {
    clientDie.controller.kill("SIGTERM", "probe over");
    await clientDie.controller.settled;
  }
  await world.stop();
}
Deno.exit(0);
