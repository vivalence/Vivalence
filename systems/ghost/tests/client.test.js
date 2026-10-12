import { specimen, atom, mime, steer } from "@vivalence/typology";
import { Client } from "../prototypes/client.js";
import { execution } from "../lifecycle/client/execution.js";
import { headless, memory } from "./headless.js";
import { boot } from "./scenarios/hello.js";

const { describe, it, expect, beforeAll, afterAll } = specimen;

const HOME = "/runtime/house/mode/home/probe";

const settle = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const until = (store, predicate, signal, ms = 15000) =>
  Promise.race([atom.until(store, predicate, signal), settle(ms).then(() => Promise.reject(new Error(`timed out waiting ${ms}ms`)))]);
const eventually = async (predicate, ms = 15000) => {
  const deadline = Date.now() + ms;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error(`timed out waiting ${ms}ms`);
    await settle(25);
  }
};
const shown = (surface) => {
  const held = surface.placed.filter((row) => row.panes !== null).at(-1);
  return held === undefined ? [] : held.panes;
};
const open = (signal) => (async function* () {
  await new Promise((resolve) => signal.addEventListener("abort", resolve, { once: true }));
})();

describe("the client die over a headless surface, against a real runtime", { sanitizeOps: false, sanitizeResources: false }, () => {
  let world = null;

  beforeAll(async () => {
    world = await boot();
  });

  afterAll(async () => {
    await world.stop();
  });

  it("signs up, mounts the runtime and both daemons, seats home, refuses a turn on a mode without a harness, seats memo with its flashcards, has the Magister deal a session into the frame, and dies clean", async () => {
    const credentials = memory();
    const typing = new AbortController();
    const surface = { ...headless({ credentials }), keys: open(typing.signal) };
    const client = new Client({ manifest: { type: "client", slug: "test" }, statics: { remote: `${world.origin}/` }, traits: ["HOME"], trait: { HOME: { reference: HOME } } });
    const die = { controller: client.controller, mask: client.mask, surface, client };
    const running = steer.dispatch.execute(execution, die);
    const signal = client.controller.abort.signal;
    const settled = client.controller.settled.then((json) => Promise.reject(new Error(`client ${json.code}: ${json.error ? json.error.message : "no error"}`)));
    const alive = (waiting) => Promise.race([waiting, settled]);

    await alive(eventually(() => surface.placed.length > 0 && shown(surface) !== null));
    expect(shown(surface)).toEqual(["crown", "signin"]);
    expect(client.runtime.lighthouse.manifest.traits).toContain("JOINABLE");

    const username = `walker-${crypto.randomUUID().slice(0, 8)}`;
    expect((await client.runtime.lighthouse.signup(username, "walk-the-walk")).status).toBe("OK");
    expect(credentials.read(world.origin)).not.toBe(null);

    await alive(until(client.runtime.$status, (status) => status.code === "HEALTHY", signal, 30000));
    expect(client.runtime.manifest.slug).toBe("house");
    await alive(eventually(() => client.runtime.daemons.length > 0, 30000));
    expect(client.runtime.daemons.map((daemon) => daemon.slug).sort()).toEqual(["hello", "memo"]);
    const [hello, memo] = ["hello", "memo"].map((slug) => client.runtime.daemons.find((daemon) => daemon.slug === slug));
    for (const daemon of [hello, memo]) await alive(until(daemon.$status, (status) => status.code === "HEALTHY", signal, 30000));

    await alive(eventually(() => client.terminals.active !== null && client.terminals.active.thread !== null, 30000));
    const terminal = client.terminals.active;
    expect(terminal.mode.reference.absolute).toBe(HOME);
    expect([terminal.thread.mode.daemon, terminal.thread.mode.host]).toEqual([null, client.runtime.daemon]);
    expect(client.runtime.daemon.modes).toContain(terminal.mode);
    expect(client.runtime.entities.thread.$entities.get().length).toBe(1);
    await alive(eventually(() => shown(surface).includes("dock")));
    expect(shown(surface)).toEqual(["crown", "navigation", "dock"]);

    const answered = await client.dispatch("ciao");
    expect(answered.refused).toBe("/*");
    expect(answered.fault).toMatch(/HARNESSED/);
    expect(surface.emitted.at(-1)).toEqual({ output: answered });

    expect(client.dock.full).toBe(false);
    await client.dispatch("/dock/full");
    expect(client.dock.full).toBe(true);

    await client.dispatch("/typo");
    expect(surface.emitted.at(-1).output.refused).toBe("/typo");

    const row = (id) => client.runtime.entities.terminal.connection.call("/findOne", { where: { id } });
    expect((await row(terminal.id)).daemon).toBe(null);
    const GREETING = "/daemon/hello/mode/demo/hello-world";
    const DOMAIN = "/daemon/memo/mode/domain/srs";
    const LATIN = "/daemon/memo/mode/topography/latin";
    const MEMO = "/daemon/memo/mode/srs/memo";
    expect(hello.modes.map((mode) => mode.reference.absolute)).toEqual([GREETING]);
    expect(client.runtime.entities.mode.$entities.get().map((mode) => mode.reference.absolute).sort()).toEqual([GREETING, DOMAIN, MEMO, LATIN, HOME]);
    const made = await client.dispatch(`/thread/new ${GREETING}`);
    expect(made.mode).toBe(GREETING);
    expect(terminal.thread.id).toBe(made.thread);
    expect([terminal.thread.mode.daemon, terminal.thread.mode.host]).toEqual([hello, hello]);
    expect(terminal.thread.mode.daemon.slug).toBe("hello");
    expect((await row(terminal.id))).toMatchObject({ daemon: "hello", thread: made.thread });
    expect(terminal.daemon).toBe(hello);
    expect((await client.dispatch("/modes")).map((mode) => mode.daemon).sort()).toEqual(["hello", "house", "memo", "memo", "memo"]);

    const dealt = await client.dispatch(`/thread/new ${MEMO}`);
    expect(dealt.mode).toBe(MEMO);
    expect([terminal.thread.mode.daemon, terminal.thread.mode.host]).toEqual([memo, memo]);
    await alive(eventually(() => terminal.buffer !== null, 30000));
    expect([terminal.buffer.mode, terminal.buffer.thread]).toEqual([terminal.thread.mode, terminal.thread]);
    expect(terminal.thread.mode.application.bundle.entries.map((entry) => entry.mime)).toEqual([mime.tty.solid, mime.dom.svelte]);
    expect(typeof (await terminal.thread.mode.application.bundle.load([mime.tty.solid])).default).toBe("function");
    await alive(eventually(() => shown(surface).includes("frame")));
    const deck = await terminal.mode.connection.call("/deck", { limit: 3 });
    expect(deck.language).toEqual({ known: "English", learning: "Latin" });
    expect(deck.cards.map((card) => [card.slug, card.status])).toEqual([["deus.noun", "UNTOUCHED"], ["dominus.noun", "UNTOUCHED"], ["verbum.noun", "UNTOUCHED"]]);
    const graded = await terminal.mode.connection.call("/grade", { card: "deus.noun", signal: "GOOD" });
    expect([graded.slug, graded.status]).toEqual(["deus.noun", "LEARNING"]);
    expect((await terminal.mode.connection.call("/deck", { limit: 3 })).cards.map((card) => card.slug)).toEqual(["dominus.noun", "verbum.noun", "fides.noun"]);

    const thread = terminal.thread;
    const replied = await client.dispatch("salve --tool session");
    expect([replied.message, replied.object.dealt, replied.object.buffer]).toEqual(["[stub] salve", 10, terminal.buffer.id]);
    expect(replied.object.cards.slice(0, 3)).toEqual(["dominus.noun", "verbum.noun", "fides.noun"]);
    await alive(eventually(() => terminal.buffer.data.deck !== undefined, 15000));
    expect(terminal.buffer.data.deck.map((card) => card.slug)).toEqual(replied.object.cards);
    await alive(eventually(() => thread.$turns.get().some((turn) => turn.role === "assistant" && turn.parts.some((part) => part.type === "text")), 30000));
    const parts = thread.$turns.get().flatMap((turn) => turn.parts.map((part) => [turn.role, part.type]));
    expect(parts).toEqual([["user", "text"], ["assistant", "tool_use"], ["user", "tool_result"], ["assistant", "text"]]);
    const [said, called, , spoken] = thread.$turns.get().flatMap((turn) => turn.parts);
    expect([said.text, called.name, spoken.text]).toEqual(["salve --tool session", "session", "[stub] salve"]);
    expect([thread.live, thread.echo]).toEqual([null, null]);

    client.runtime.lighthouse.logout();
    expect(client.runtime.lighthouse.isAuthorized).toBe(false);
    expect(credentials.read(world.origin)).toBe(null);
    await alive(eventually(() => shown(surface).includes("signin")));

    await client.controller.kill("SIGTERM", "walk done");
    await running;
    typing.abort();
    const last = new Map(surface.placed.map((row) => [row.pane, row.panes]));
    expect([...last.keys()].sort()).toEqual(["crown", "dock", "frame", "navigation", "signin"]);
    expect([...last.values()].every((panes) => panes === null)).toBe(true);
    expect(client.controller.status.reflection.code).toBe("STOPPED");
  });
});
