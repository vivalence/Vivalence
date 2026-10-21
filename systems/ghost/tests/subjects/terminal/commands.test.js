import { atom } from "nanostores";
import { Controller, KeySignal, Path, ReplSignal, Span, Url, Vector, belt, mime, shape, specimen, steer, v } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";
import { chrome } from "../../../surfaces/index.js";

const repository = (rows, mint) => {
  const $entities = atom(rows);
  const writes = [];
  return {
    $entities,
    writes,
    async create(data) {
      const row = mint(data, $entities.get().length);
      $entities.set([...$entities.get(), row]);
      return row;
    },
    async updateOne(where, data) {
      writes.push({ where, data });
      return $entities.get().find((row) => row.id === where.id);
    },
    async removeOne(where) {
      $entities.set($entities.get().filter((row) => row.id !== where.id));
    },
  };
};

const hydrated = (entity, vocabulary) => Object.assign(entity, { trait: belt.traits.cast(entity, vocabulary) });

const activity = (id, status) => {
  const held = Object.assign(new ghost.entities.activity.Activity(), { id, type: "HALLUCINATION", steps: [] });
  held.status = status;
  return held;
};

specimen.describe("commands — each dispatched on a stub client and terminal: its effect, or its NotFound · VALIDATION fault", () => {
  const root = new Controller({ stdout: new Span("ghost") });
  const mask = { manifest: { type: "client", slug: "ghost", traits: [] }, reference: new Path("/client/ghost"), modes: [], trait: {} };
  const client = new ghost.client.Client({ controller: root.branch("client"), mask, register: { modes: [] }, instance: null });
  client.app = new ghost.app.App({ client, surface: chrome });
  client.app.bridge.$hidden.set(["modes"]);
  client.app.telemetry.$state.set({ ...client.app.telemetry.state, selection: "7" });

  const lighthouse = Object.assign(new ghost.entities.lighthouse.Lighthouse(), { manifest: { traits: ["AUTOLOGIN"] } });
  lighthouse.connection = { fetch: async (route, body) => ({ body: { user: { slug: body.username, traits: [], trait: {} }, authority: { access: "a", refresh: "r" } } }) };
  lighthouse.$user.set({ slug: "beef", traits: [], trait: {} });
  lighthouse.$status.set({ code: "VERIFIED" });

  const memo = Object.assign(new ghost.entities.mode.Mode(), { id: "m1", type: "srs", slug: "memo", traits: ["HARNESSED"], daemon: null, reference: new Path("/runtime/house/mode/srs/memo") });
  const probe = Object.assign(new ghost.entities.mode.Mode(), { id: "m2", type: "home", slug: "probe", traits: ["EXPOSED"], daemon: null, reference: new Path("/runtime/house/mode/home/probe") });
  const REPLY = [
    { event: "/turn/open", turn: { role: "assistant", id: "a9" } },
    { event: "/part/open", index: 0, part: { type: "text", text: "" } },
    { event: "/part/delta", index: 0, delta: { text: "cia" } },
    { event: "/part/delta", index: 0, delta: { text: "o!" } },
    { event: "/part/close", index: 0 },
    { event: "/turn/close", meta: { state: "complete" } },
    { event: "/response/close", meta: { state: "complete", rounds: 1 } },
  ];
  const requests = [];
  memo.harness = {
    dialogue: {
      stream: async function* (request) {
        requests.push(request);
        for (const packet of REPLY) yield structuredClone(packet);
      },
    },
  };

  const thread = hydrated(Object.assign(new ghost.entities.thread.Thread(), { id: "th1", mode: memo, traits: ["LABELED"], trait: { LABELED: { name: "flamingo" } } }), v.thread.traits);
  const other = hydrated(Object.assign(new ghost.entities.thread.Thread(), { id: "th2", mode: probe }), v.thread.traits);
  const buffer = Object.assign(new ghost.entities.buffer.Buffer(), { id: "b1", thread, traits: ["LABELED"], trait: { LABELED: { name: "memo #1" } } });
  const VIEWS = {
    "/view/v-board": { id: "v-board", slug: "play", mime: mime.tty.solid, traits: ["FRAME"], entry: "cells/Board.js", files: [{ id: "f-board", path: "cells/Board.js", integrity: "sha256-e7f3" }] },
    "/view/v-glance": { id: "v-glance", slug: "glance", mime: mime.tty.solid, traits: ["CELL"], entry: "cells/Glance.js", files: [{ id: "f-glance", path: "cells/Glance.js", integrity: "sha256-5d2a" }] },
  };
  const board = Object.assign(new ghost.entities.buffer.Buffer(), { id: "b2", thread, mode: { id: "m-play", slug: "play", views: [{ id: "v-board" }, { id: "v-glance" }] }, traits: ["LABELED"], trait: { LABELED: { name: "board one" } }, data: { fen: "8/8" } });
  thread.$buffers = atom([buffer, board]);
  const paused = activity("a1", "PAUSED");
  const running = activity("a2", "RUNNING");
  thread.$activities = atom([paused, running]);

  client.runtime = new ghost.entities.runtime.Runtime({ reference: new Path("/runtime/house"), remote: new Url("http://127.0.0.1:9"), lighthouse, connection: { branch: (path) => ({ path, call: async (route) => VIEWS[route] }) } });
  client.runtime.$status.set({ code: "RUNNING" });
  const terminals = repository([], (data, count) => Object.assign(new ghost.terminal.Terminal(), { id: `t${count + 1}`, index: count, client, runtime: client.runtime, repository: terminals, controller: client.controller.branch(`terminal/t${count + 1}`), ...data }));
  const buffers = repository([buffer, board], (data, count) => Object.assign(new ghost.entities.buffer.Buffer(), { id: `b${count + 1}`, ...data }));
  const threads = repository([thread, other], (data, count) => hydrated(Object.assign(new ghost.entities.thread.Thread(), { id: `th${count + 1}`, ...data, mode: memo }), v.thread.traits));
  client.runtime.entities = {
    terminal: terminals,
    thread: threads,
    buffer: buffers,
    mode: { $entities: atom([memo, probe]) },
    daemon: { $entities: atom([]) },
    activity: { $entities: atom([paused, running]) },
    turn: {
      $entities: atom([]),
      merges: [],
      async merge(raw) {
        this.merges.push(structuredClone(raw));
        const held = this.$entities.get().find((turn) => turn.id === raw.id) ?? Object.assign(new ghost.entities.turn.Turn(), { id: raw.id });
        Object.assign(held, raw);
        this.$entities.set([...this.$entities.get().filter((turn) => turn !== held), held]);
        return held;
      },
    },
  };
  const terminal = Object.assign(new ghost.terminal.Terminal(), { id: "t1", index: 0, client, runtime: client.runtime, repository: terminals, controller: client.controller.branch("terminal/t1") });
  terminals.$entities.set([terminal]);
  terminal.$thread.set(thread);
  thread.controller = terminal.controller.branch("thread/th1");
  client.app.bridge.$terminal.set(terminal.id);

  const repl = new Vector().graft(...Object.values(ghost.client.commands), ...Object.values(ghost.app.commands), ...Object.values(ghost.terminal.commands));
  const run = async (line) => {
    const signal = new ReplSignal(line);
    const replDie = { signal, client, runtime: client.runtime, terminal, controller: terminal.controller.branch(signal.pathname), repl: { commands: repl }, output: undefined };
    return steer.dispatch.execute(repl, replDie, signal);
  };
  const fault = (line) => run(line).then(() => null, (error) => error.code);

  specimen.it("/help journals the strip as a message; the value is nothing", async () => {
    specimen.expect(await run("/help")).toBe(undefined);
    specimen.expect(Object.keys(client.controller.stdout.history.filter((record) => ["log"].includes(record.track)).at(-1).data.branches)).toContain("dock");
  });

  specimen.it("/terminal <index> seats; an unknown index faults; /terminal/new mints and seats on the bridge; /terminal/close removes, the next is the Layout's; a word is VALIDATION", async () => {
    specimen.expect(await run("/terminal 0")).toBe("terminal #0");
    specimen.expect(await fault("/terminal 7")).toBe(undefined);
    specimen.expect(await fault("/terminal seven")).toBe("VALIDATION");
    specimen.expect(await run("/terminal/new")).toBe("terminal #1");
    specimen.expect(client.app.bridge.terminal).toBe("t2");
    const minted = terminals.$entities.get().at(-1);
    specimen.expect(await steer.dispatch.execute(repl, { signal: new ReplSignal("/terminal/close"), client, runtime: client.runtime, terminal: minted, controller: minted.controller, repl: { commands: repl }, output: undefined }, new ReplSignal("/terminal/close"))).toBe("terminal #1 closed");
    specimen.expect(terminals.$entities.get()).toEqual([terminal]);
    specimen.expect(await run("/terminal 0")).toBe("terminal #0");
    specimen.expect(client.app.bridge.terminal).toBe("t1");
  });

  specimen.it("/runtime lists the hosts with their standing", async () => {
    specimen.expect(await run("/runtime")).toEqual([{ host: "runtime", reference: "/runtime/house", standing: "RUNNING", modes: 2 }]);
  });

  specimen.it("/lighthouse is the standing; /lighthouse/login takes username and password, one word is VALIDATION; /lighthouse/logout forgets", async () => {
    specimen.expect(await run("/lighthouse")).toEqual({ standing: "VERIFIED", user: { slug: "beef", traits: [], trait: {} }, traits: ["AUTOLOGIN"] });
    specimen.expect(await fault("/lighthouse/login beef")).toBe("VALIDATION");
    specimen.expect((await run("/lighthouse/login beef hunter2")).standing).toBe("AUTHENTICATED");
    specimen.expect((await run("/lighthouse/login")).standing).toBe("LOGGED_OUT");
    specimen.expect((await run("/lighthouse/login beef hunter2")).standing).toBe("AUTHENTICATED");
    specimen.expect((await run("/lighthouse/logout")).standing).toBe("LOGGED_OUT");
  });

  specimen.it("/telemetry toggles the app's telemetry window, a tab opens it on that tab, off shuts it; /telemetry/clear moves the watermark; a bad tab is VALIDATION", async () => {
    specimen.expect(await run("/telemetry")).toBe("telemetry logger");
    specimen.expect(await run("/telemetry inspector")).toBe("telemetry inspector");
    specimen.expect(client.app.telemetry.state).toMatchObject({ open: true, view: "inspector" });
    specimen.expect(await run("/telemetry")).toBe("telemetry off");
    specimen.expect(await run("/telemetry inspector")).toBe("telemetry inspector");
    specimen.expect(await run("/telemetry off")).toBe("telemetry off");
    specimen.expect(await run("/telemetry/clear")).toBe("telemetry cleared");
    specimen.expect(client.app.telemetry.state.since).toBeGreaterThan(0);
    specimen.expect(client.app.telemetry.state.selection).toBe(null);
    specimen.expect(await fault("/telemetry window")).toBe("VALIDATION");
  });

  specimen.it("/sidebar/toggle flips the bridge's sidebar, twice is where it was; /sidebar open · closed sets it; a bare /sidebar is VALIDATION", async () => {
    const open = client.app.bridge.sidebar.open;
    await run("/sidebar/toggle");
    specimen.expect(client.app.bridge.sidebar.open).toBe(!open);
    await run("/sidebar/toggle");
    specimen.expect(client.app.bridge.sidebar.open).toBe(open);
    specimen.expect(await fault("/sidebar")).toBe("VALIDATION");
    specimen.expect([await run("/sidebar open"), await run("/sidebar open"), client.app.bridge.sidebar.open]).toEqual(["sidebar open", "sidebar open", true]);
    specimen.expect([await run("/sidebar closed"), client.app.bridge.sidebar.open]).toEqual(["sidebar closed", false]);
    specimen.expect(await fault("/sidebar ajar")).toBe("VALIDATION");
  });

  specimen.it("/sidebar/width sets the bridge's sidebar width, the open flag kept; outside 24..96 or a word is VALIDATION", async () => {
    const open = client.app.bridge.sidebar.open;
    specimen.expect([await run("/sidebar/width 52"), client.app.bridge.sidebar]).toEqual(["sidebar 52 wide", { open, width: 52 }]);
    specimen.expect(await fault("/sidebar/width 23")).toBe("VALIDATION");
    specimen.expect(await fault("/sidebar/width 97")).toBe("VALIDATION");
    specimen.expect(await fault("/sidebar/width wide")).toBe("VALIDATION");
    specimen.expect(client.app.bridge.sidebar.width).toBe(52);
    await run("/sidebar/width 39");
  });

  specimen.it("/theme/set names the session's theme on the bridge, the app reads it first; bare, the next after the current; not a theme is VALIDATION", async () => {
    specimen.expect([await run("/theme/set northsea"), client.app.theme]).toEqual(["theme northsea", "northsea"]);
    specimen.expect([await run("/theme/set"), client.app.theme]).toEqual(["theme parchment", "parchment"]);
    specimen.expect(await fault("/theme/set plaid")).toBe("VALIDATION");
    client.app.bridge.$theme.set(null);
  });

  specimen.it("/widget/toggle/entity · display · system open their popover above the modeline and close it again — /popover <widget>; /widget/toggle/dock is /dock closed on an open dock, /dock <shown> on a closed one — one owner, the terminal's DOCKED; /widget/toggle/sidebar is /sidebar/toggle", async () => {
    const before = { popover: client.app.bridge.popover, hidden: client.app.bridge.hidden, sidebar: client.app.bridge.sidebar };
    client.app.bridge.$popover.set(null);
    specimen.expect([await run("/widget/toggle/entity"), client.app.bridge.popover]).toEqual(["popover entity", { held: "entity", anchor: undefined }]);
    specimen.expect([await run("/widget/toggle/display"), client.app.bridge.popover.held]).toEqual(["popover display", "display"]);
    specimen.expect([await run("/widget/toggle/display"), client.app.bridge.popover]).toEqual(["popover closed", null]);
    specimen.expect([await run("/widget/toggle/system"), await run("/widget/toggle/system")]).toEqual(["popover system", "popover closed"]);
    const user = lighthouse.user;
    lighthouse.$user.set({ slug: "beef", traits: [], trait: {} });
    terminal.trait.DOCKED = { view: "messenger", shown: "messenger" };
    specimen.expect(await run("/widget/toggle/dock")).toEqual({ DOCKED: { view: "closed" } });
    specimen.expect(terminals.writes.at(-1).data.trait.DOCKED).toEqual({ view: "closed", shown: "messenger" });
    terminal.trait.DOCKED = { view: "closed", shown: "messenger" };
    specimen.expect(await run("/widget/toggle/dock")).toEqual({ DOCKED: { view: "messenger", shown: "messenger" } });
    specimen.expect(client.app.bridge.hidden.includes("dock")).toBe(false);
    delete terminal.trait.DOCKED;
    lighthouse.$user.set(user);
    const open = client.app.bridge.sidebar.open;
    specimen.expect([await run("/widget/toggle/sidebar"), client.app.bridge.sidebar.open]).toEqual([open ? "sidebar closed" : "sidebar open", !open]);
    client.app.bridge.$popover.set(before.popover);
    client.app.bridge.$hidden.set(before.hidden);
    client.app.bridge.$sidebar.set(before.sidebar);
  });

  specimen.it("/widgets/close shuts the sidebar and drops the popover, the dock kept; /widget/toggle/close is /widgets/close", async () => {
    const before = { popover: client.app.bridge.popover, hidden: client.app.bridge.hidden, sidebar: client.app.bridge.sidebar };
    client.app.bridge.$sidebar.set({ ...before.sidebar, open: true });
    client.app.bridge.$popover.set({ held: "entity", anchor: 5 });
    client.app.bridge.$hidden.set(["dock"]);
    specimen.expect([await run("/widgets/close"), client.app.bridge.sidebar.open, client.app.bridge.popover, client.app.bridge.hidden]).toEqual(["widgets closed", false, null, ["dock"]]);
    client.app.bridge.$sidebar.set({ ...client.app.bridge.sidebar, open: true });
    client.app.bridge.$popover.set({ held: "system", anchor: 90 });
    specimen.expect([await run("/widget/toggle/close"), client.app.bridge.sidebar.open, client.app.bridge.popover]).toEqual(["widgets closed", false, null]);
    client.app.bridge.$popover.set(before.popover);
    client.app.bridge.$hidden.set(before.hidden);
    client.app.bridge.$sidebar.set(before.sidebar);
  });

  specimen.it("/filter <kind> [query] hands the keys to that list's search, the rest of the line its query; /filter/close clears a query, then hands the keys back; /filter/expand · /filter/pick · /filter/daemon · /filter/trait flip the bridge's sections; a kind outside thread · mode is VALIDATION", async () => {
    const before = { focus: client.app.bridge.focus, sections: client.app.bridge.sections };
    client.app.bridge.$sections.set({ filter: {}, expand: {}, pick: null, hostsOff: { thread: [], mode: [] }, traits: { thread: [], mode: ["VIEWABLE"] } });
    specimen.expect([await run("/filter mode domain chess"), client.app.bridge.focus, client.app.bridge.sections.filter]).toEqual(["searching modes", "filter/mode", { mode: "domain chess" }]);
    specimen.expect([await run("/filter mode"), client.app.bridge.sections.filter]).toEqual(["searching modes", { mode: "domain chess" }]);
    specimen.expect([await run("/filter/close"), client.app.bridge.focus, client.app.bridge.sections.filter]).toEqual(["modes unfiltered", "filter/mode", { mode: "" }]);
    specimen.expect([await run("/filter/close"), client.app.bridge.focus, await run("/filter/close")]).toEqual(["search closed", "composer", "no search open"]);
    specimen.expect([await run("/filter/expand thread"), client.app.bridge.sections.expand, await run("/filter/expand thread"), client.app.bridge.sections.expand]).toEqual(["threads whole", { thread: true }, "threads cut", {}]);
    specimen.expect([await run("/filter/pick mode"), client.app.bridge.sections.pick, await run("/filter/pick mode"), client.app.bridge.sections.pick]).toEqual(["hosts of modes", "mode", "hosts hidden", null]);
    specimen.expect([await run("/filter/daemon mode /daemon/chess"), client.app.bridge.sections.hostsOff, await run("/filter/daemon mode /daemon/chess"), client.app.bridge.sections.hostsOff]).toEqual(["/daemon/chess hidden from modes", { thread: [], mode: ["/daemon/chess"] }, "/daemon/chess shown in modes", { thread: [], mode: [] }]);
    specimen.expect([await run("/filter/trait mode VIEWABLE"), client.app.bridge.sections.traits, await run("/filter/trait mode VIEWABLE"), client.app.bridge.sections.traits]).toEqual(["modes any VIEWABLE", { thread: [], mode: [] }, "modes VIEWABLE", { thread: [], mode: ["VIEWABLE"] }]);
    specimen.expect(await fault("/filter buffer")).toBe("VALIDATION");
    client.app.bridge.$focus.set(before.focus);
    client.app.bridge.$sections.set(before.sections);
  });

  specimen.it("/focus <panel> hands the keys to the frame or the composer; bare, it flips between them; another panel is VALIDATION", async () => {
    const before = client.app.bridge.focus;
    specimen.expect([await run("/focus frame"), client.app.bridge.focus]).toEqual(["keys to the frame", "frame"]);
    specimen.expect([await run("/focus"), client.app.bridge.focus, await run("/focus"), client.app.bridge.focus]).toEqual(["keys to the composer", "composer", "keys to the frame", "frame"]);
    specimen.expect(await fault("/focus sidebar")).toBe("VALIDATION");
    client.app.bridge.$focus.set(before);
  });

  specimen.it("/repl opens the catalog — every command — with / prefilled, a draft that is a line kept; /repl/close drops it and the typed line; /legend/close flushes the held keys", async () => {
    client.app.bridge.$draft.set("hello");
    specimen.expect(await run("/repl")).toBe("repl open");
    specimen.expect([terminal.repl.catalog.map((row) => row.nature).includes("/repl/close"), client.app.bridge.draft, client.app.bridge.focus]).toEqual([true, "/", "composer"]);
    client.app.bridge.$draft.set("/dock");
    await run("/repl");
    specimen.expect(client.app.bridge.draft).toBe("/dock");
    specimen.expect([await run("/repl/close"), terminal.repl.catalog, client.app.bridge.draft]).toEqual(["repl closed", null, ""]);
    terminal.legend.presses.enqueue(new KeySignal("leader"));
    specimen.expect([await run("/legend/close"), terminal.legend.presses.backlog, terminal.legend.chord]).toEqual(["legend closed", [], null]);
    client.app.bridge.$draft.set("");
  });

  specimen.it("/repl/next · /repl/previous move the selection over what the draft shows, held at both ends; /repl/complete fills the draft with the selected row", async () => {
    client.app.bridge.$draft.set("/sidebar");
    await run("/repl");
    specimen.expect([await run("/repl/previous"), await run("/repl/next"), await run("/repl/next"), await run("/repl/next"), await run("/repl/next")]).toEqual(["repl 0", "repl 1", "repl 2", "repl 3", "repl 3"]);
    await run("/repl/previous");
    await run("/repl/previous");
    specimen.expect([await run("/repl/complete"), client.app.bridge.draft, client.app.bridge.selected]).toEqual(["/sidebar/toggle", "/sidebar/toggle", 0]);
    client.app.bridge.$draft.set("/zzz");
    specimen.expect(await run("/repl/complete")).toBe("nothing to complete");
    await run("/repl/close");
    client.app.bridge.$draft.set("");
  });

  specimen.it("/popover floats a segment's widget at its column; the same segment closes it, another moves it; /popover/close drops it", async () => {
    specimen.expect(await run("/popover entity 5")).toBe("popover entity");
    specimen.expect(client.app.bridge.popover).toEqual({ held: "entity", anchor: 5 });
    specimen.expect(await run("/popover display 80")).toBe("popover display");
    specimen.expect(client.app.bridge.popover).toEqual({ held: "display", anchor: 80 });
    specimen.expect([await run("/popover display 80"), client.app.bridge.popover]).toEqual(["popover closed", null]);
    specimen.expect([await run("/popover system"), client.app.bridge.popover]).toEqual(["popover system", { held: "system", anchor: undefined }]);
    specimen.expect([await run("/popover/close"), client.app.bridge.popover]).toEqual(["popover closed", null]);
    specimen.expect(await fault("/popover box")).toBe("VALIDATION");
  });

  specimen.it("/modes lists; /mode narrows and seats the mode's newest thread through the terminal's write", async () => {
    specimen.expect((await run("/modes")).map((row) => row.reference)).toEqual(["/runtime/house/mode/srs/memo", "/runtime/house/mode/home/probe"]);
    specimen.expect(await run("/mode probe")).toBe("/runtime/house/mode/home/probe · thread #th2");
    specimen.expect(terminals.writes.at(-1)).toEqual({ where: { id: "t1" }, data: { daemon: null, thread: "th2" } });
    specimen.expect(await run("/mode mode")).toEqual({ which: ["/runtime/house/mode/srs/memo", "/runtime/house/mode/home/probe"] });
  });

  specimen.it("/thread narrows by id or label and seats; no match answers the candidates; /thread/new mints on the seated mode; /thread/label claims LABELED", async () => {
    specimen.expect(await run("/thread flamingo")).toBe("thread #th1 · /runtime/house/mode/srs/memo");
    specimen.expect(await run("/thread")).toEqual({ which: [{ id: "th1", label: "flamingo" }, { id: "th2", label: undefined }] });
    specimen.expect(await run("/thread/new")).toBe("thread #th3 · /runtime/house/mode/srs/memo");
    specimen.expect(terminals.writes.at(-1)).toEqual({ where: { id: "t1" }, data: { daemon: null, thread: "th3" } });
    specimen.expect(await run('/thread/label "six species"')).toBe("thread #th1 · six species");
    specimen.expect(threads.writes.at(-1)).toMatchObject({ where: { id: "th1" }, data: { traits: ["LABELED"], trait: { LABELED: { name: "six species" } } } });
    specimen.expect(await fault("/thread/label")).toBe("VALIDATION");
  });

  specimen.it("/buffer seats a buffer of the thread into the frame by its label; an unknown label faults", async () => {
    specimen.expect(await run('/buffer "memo #1"')).toBe("buffer #b1 · memo #1");
    specimen.expect(terminal.buffer).toBe(buffer);
    specimen.expect(await fault("/buffer nope")).toBe(undefined);
  });

  specimen.it("/buffer/full seats the buffer and closes the dock, again on the framed one opens it docked; the rest of the line is the label; no frame or an unknown label faults", async () => {
    lighthouse.$user.set({ slug: "beef", traits: [], trait: {} });
    specimen.expect(await run("/buffer/full board one")).toEqual({ DOCKED: { view: "closed" } });
    specimen.expect(terminal.buffer).toBe(board);
    specimen.expect(terminals.writes.at(-1)).toEqual({ where: { id: "t1" }, data: { traits: ["DOCKED"], trait: { DOCKED: { view: "closed" } } } });
    Object.assign(terminal, { traits: ["DOCKED"], trait: { DOCKED: { view: "closed" } } });
    specimen.expect(await run("/buffer/full")).toEqual({ DOCKED: { view: "docked" } });
    Object.assign(terminal, { traits: [], trait: {} });
    specimen.expect(await fault("/buffer/full nope")).toBe(undefined);
    terminal.$buffer.set(null);
    specimen.expect(await fault("/buffer/full")).toBe(undefined);
    terminal.$buffer.set(buffer);
  });

  specimen.it("/frame/set <slug> writes RENDERED.frame of the framed buffer, /cell/set <slug> <label> RENDERED.cell of the named one, through its updateOne; data stays; a slug the place does not list, no frame or an unknown label faults; no label is VALIDATION", async () => {
    terminal.$buffer.set(board);
    specimen.expect(await run("/frame/set play")).toBe("board one · frame play");
    specimen.expect(buffers.writes.at(-1).where).toEqual({ id: "b2" });
    specimen.expect(buffers.writes.at(-1).data.trait.RENDERED.frame).toBe("play");
    specimen.expect(buffers.writes.at(-1).data.data).toBe(undefined);
    specimen.expect(await fault("/frame/set glance")).toBe(undefined);
    specimen.expect(await run("/cell/set glance board one")).toBe("board one · cell glance");
    specimen.expect(buffers.writes.at(-1).data.trait.RENDERED.cell).toBe("glance");
    specimen.expect(await fault("/cell/set play board one")).toBe(undefined);
    specimen.expect(await fault("/cell/set glance nope")).toBe(undefined);
    specimen.expect(await fault("/cell/set glance")).toBe("VALIDATION");
    terminal.$buffer.set(null);
    specimen.expect(await fault("/frame/set play")).toBe(undefined);
    terminal.$buffer.set(buffer);
  });

  specimen.it("/buffer/close empties the frame, the buffer stays on its thread; a closed dock reopens docked; no frame faults", async () => {
    Object.assign(terminal, { traits: ["DOCKED"], trait: { DOCKED: { view: "closed" } } });
    specimen.expect(await run("/buffer/close")).toBe("frame closed");
    specimen.expect(terminal.buffer).toBe(null);
    specimen.expect(thread.$buffers.get()).toContain(buffer);
    specimen.expect(terminals.writes.at(-1)).toEqual({ where: { id: "t1" }, data: { traits: ["DOCKED"], trait: { DOCKED: { view: "docked" } } } });
    Object.assign(terminal, { traits: [], trait: {} });
    const before = terminals.writes.length;
    terminal.$buffer.set(buffer);
    specimen.expect(await run("/buffer/close")).toBe("frame closed");
    specimen.expect(terminals.writes.length).toBe(before);
    specimen.expect(await fault("/buffer/close")).toBe(undefined);
    terminal.$buffer.set(buffer);
  });

  specimen.it("/dictate answers that the wire has no dictation; it writes nothing", async () => {
    const before = [client.app.bridge.draft, client.app.bridge.sidebar, client.app.bridge.hidden, client.app.bridge.popover];
    specimen.expect(await run("/dictate")).toBe("no dictation on this wire");
    specimen.expect([client.app.bridge.draft, client.app.bridge.sidebar, client.app.bridge.hidden, client.app.bridge.popover]).toEqual(before);
  });

  specimen.it("/attach · /detach fault loudly with the design's valence: the wire has no attachments; no name is VALIDATION", async () => {
    specimen.expect(await run("/attach notes.md").catch((error) => error.message)).toBe("no attachments on this wire — /attach notes.md: attach a file to the next turn");
    specimen.expect(await run("/detach my notes.md").catch((error) => error.message)).toBe("no attachments on this wire — /detach my notes.md: drop an attachment");
    specimen.expect(await fault("/attach")).toBe("VALIDATION");
    specimen.expect(await fault("/detach")).toBe("VALIDATION");
  });

  specimen.it("owed · loudest: every activity not settled is owed any signal; the loudest live state", () => {
    const done = activity("a0", "DONE");
    specimen.expect(ghost.belt.activity.owed("SIGCONT", [paused, running, done])).toEqual([paused, running]);
    specimen.expect(ghost.belt.activity.owed("SIGSTOP", [paused, running, done])).toEqual([paused, running]);
    specimen.expect(ghost.belt.activity.owed("SIGTERM", [paused, running, done])).toEqual([paused, running]);
    specimen.expect(ghost.belt.activity.loudest([paused, running])).toBe("RUNNING");
    specimen.expect(ghost.belt.activity.loudest([])).toBe("NONE");
  });

  specimen.it("/pause · /resume · /stop · /abort — each IS its signal, sent to every activity owed it", async () => {
    specimen.expect(await run("/pause")).toEqual({ SIGSTOP: ["a1", "a2"] });
    specimen.expect([paused.status, running.status]).toEqual(["PAUSED", "PAUSED"]);
    specimen.expect(await run("/resume")).toEqual({ SIGCONT: ["a1", "a2"] });
    specimen.expect([paused.status, running.status]).toEqual(["RUNNING", "RUNNING"]);
    specimen.expect(await run("/stop")).toEqual({ SIGTERM: ["a1", "a2"] });
    specimen.expect(paused.status).toBe("STOPPING");
    specimen.expect(await run("/abort")).toEqual({ SIGKILL: ["a1", "a2"] });
    specimen.expect(running.status).toBe("ABORTED");
    specimen.expect(await run("/resume")).toEqual({ SIGCONT: [] });
  });

  specimen.it("/activity lists the thread's activities", async () => {
    specimen.expect(await run("/activity")).toEqual([
      { id: "a1", type: "HALLUCINATION", status: "ABORTED", steps: 0 },
      { id: "a2", type: "HALLUCINATION", status: "ABORTED", steps: 0 },
    ]);
  });

  specimen.it("/tune · /effort · /rounds claim INTELLIGENT on the seated thread, field-wise; a value outside the schema is VALIDATION", async () => {
    specimen.expect(await run("/tune fast")).toEqual({ INTELLIGENT: { tune: "fast" } });
    specimen.expect(threads.writes.at(-1)).toMatchObject({ where: { id: "th1" }, data: { traits: ["LABELED", "INTELLIGENT"], trait: { LABELED: { name: "flamingo" }, INTELLIGENT: { tune: "fast" } } } });
    specimen.expect(await run("/effort high")).toEqual({ INTELLIGENT: { effort: "high" } });
    specimen.expect(await run("/rounds 12")).toEqual({ INTELLIGENT: { rounds: 12 } });
    specimen.expect(await fault("/rounds 99")).toBe("VALIDATION");
    specimen.expect(await fault("/tune lazy")).toBe("VALIDATION");
  });

  specimen.it("/dock · /dock/lens · /split claim DOCKED on the terminal, field-wise — /dock routes a side to align, a view to view — through the terminal's updateOne; a bad word is VALIDATION", async () => {
    specimen.expect(await run("/dock left")).toEqual({ DOCKED: { align: "left" } });
    specimen.expect(terminals.writes.at(-1)).toEqual({ where: { id: "t1" }, data: { traits: ["DOCKED"], trait: { DOCKED: { align: "left" } } } });
    specimen.expect(await run("/dock closed")).toEqual({ DOCKED: { view: "closed" } });
    specimen.expect(await run("/dock docked")).toEqual({ DOCKED: { view: "docked", shown: "docked" } });
    specimen.expect(await run("/dock messenger")).toEqual({ DOCKED: { view: "messenger", shown: "messenger" } });
    specimen.expect(await run("/dock/lens trace")).toEqual({ DOCKED: { lens: "trace" } });
    specimen.expect(await run("/split 0.5")).toEqual({ DOCKED: { share: 0.5 } });
    specimen.expect(await fault("/dock up")).toBe("VALIDATION");
    specimen.expect(await fault("/split 5")).toBe("VALIDATION");
    specimen.expect(await fault("/dock/lens nope")).toBe("VALIDATION");
  });

  specimen.it("/set <path> <value> writes one inspector path — DOCKED through the terminal's updateOne, INTELLIGENT · LABELED through the thread's updateOne, the bridge in place; a set toggles; an unknown path or a value outside its schema is loud", async () => {
    specimen.expect(await run("/set terminal.dock.view closed")).toEqual({ DOCKED: { view: "closed" } });
    specimen.expect(terminals.writes.at(-1)).toEqual({ where: { id: "t1" }, data: { traits: ["DOCKED"], trait: { DOCKED: { view: "closed" } } } });
    specimen.expect(await run("/set terminal.dock.share 0.5")).toEqual({ DOCKED: { share: 0.5 } });
    specimen.expect(await run("/set thread.effort high")).toEqual({ INTELLIGENT: { effort: "high" } });
    specimen.expect(await run("/set thread.rounds 12")).toEqual({ INTELLIGENT: { rounds: 12 } });
    specimen.expect(await run("/set thread.label six species")).toEqual({ LABELED: { name: "six species" } });
    specimen.expect(threads.writes.at(-1)).toMatchObject({ where: { id: "th1" }, data: { traits: ["LABELED"], trait: { LABELED: { name: "six species" } } } });
    specimen.expect(await run("/set bridge.sidebar true")).toBe("bridge.sidebar true");
    specimen.expect(client.app.bridge.sidebar.open).toBe(true);
    specimen.expect(await run("/set bridge.hidden modes")).toBe("bridge.hidden none");
    specimen.expect(await run("/set bridge.hidden buffers")).toBe("bridge.hidden buffers");
    specimen.expect(await fault("/set terminal.dock.view up")).toBe("VALIDATION");
    specimen.expect(await fault("/set thread.rounds 99")).toBe("VALIDATION");
    const message = await run("/set terminal.dock.colour red").then(() => null, (error) => error.message);
    specimen.expect(message).toContain('"terminal.dock.colour" is not a writable path');
    specimen.expect(message).toContain("terminal.dock.view · terminal.dock.align");
  });

  specimen.it("* — a bare line streams to a HARNESSED mode: every packet merges into ONE turn under the runtime's id, no stream record; on a mode without HARNESSED it is NotFound", async () => {
    await run("ciao");
    specimen.expect(requests.at(-1)).toMatchObject({ thread: "th1", terminal: "t1" });
    specimen.expect(client.runtime.entities.turn.merges).toHaveLength(REPLY.length);
    specimen.expect(new Set(client.runtime.entities.turn.merges.map((raw) => raw.id))).toEqual(new Set(["a9"]));
    specimen.expect(client.runtime.entities.turn.$entities.get().map((turn) => ({ id: turn.id, role: turn.role, parts: turn.parts, meta: turn.meta, thread: turn.thread, mode: turn.mode }))).toEqual([
      { id: "a9", role: "assistant", parts: [{ type: "text", text: "ciao!" }], meta: { state: "complete" }, thread: "th1", mode: "m1" },
    ]);
    specimen.expect(thread.controller.stdout.history.filter((record) => ["stream"].includes(record.track))).toEqual([]);
    terminal.$thread.set(other);
    specimen.expect(await fault("ciao")).toBe("NOT_FOUND");
    terminal.$thread.set(thread);
  });

  specimen.it("every command of the three owners — client · app · terminal — carries a nature, a valence with an Example, and the chords of the keymap", () => {
    const rows = steer.trie.rollup(repl, (carry, effect, steps) => steps.at(-1)).map((entry) => entry.fn);
    for (const pattern of rows) specimen.expect(pattern.valence).toMatch(/Example: /);
    const chords = Object.fromEntries(rows.filter((pattern) => pattern.chord !== undefined).map((pattern) => [pattern.chord, pattern.nature]));
    specimen.expect(chords).toEqual({
      "leader/?": "help",
      "leader/q": "quit",
      "leader/e/n": "terminal",
      "leader/s/r": "runtime",
      "leader/s/a": "anima",
      "leader/s/l": "lighthouse",
      "leader/s/o": "logout",
      "leader/m": "mode",
      "leader/e/t": "thread",
      "leader/e/l": "label",
      "leader/e/b": "buffer",
      "leader/e/a": "set",
      "leader/e/u": "close",
      "leader/a/p": "pause",
      "leader/a/c": "resume",
      "leader/a/s": "stop",
      "leader/a/k": "abort",
      "leader/a/a": "activity",
      "leader/h/t": "tune",
      "leader/h/e": "effort",
      "leader/h/r": "rounds",
      "leader/d/b": "toggle",
      "leader/d/t": "set",
      "leader/d/f": "focus",
      "leader/w/c": "close",
      "leader/w/b": "sidebar",
      "leader/w/e": "entity",
      "leader/w/d": "display",
      "leader/w/s": "system",
      "leader/w/j": "dock",
      "leader/leader": "repl",
      esc: "close",
      "leader/esc": "close",
      "leader/d/d": "dock",
      "leader/d/j": "lens",
      "leader/d/s": "split",
      "leader/s/t": "telemetry",
    });
  });

  specimen.it("/thread/delete removes the seated thread and seats the mode's newest other thread, or none; /buffer/delete removes the framed buffer and closes the frame; no frame faults", async () => {
    specimen.expect(await run("/thread flamingo")).toBe("thread #th1 · /runtime/house/mode/srs/memo");
    const newest = threads.$entities.get().filter((held) => held !== thread && held.mode === memo).at(-1);
    specimen.expect(await run("/thread/delete")).toBe("thread #th1 removed");
    specimen.expect(terminals.writes.at(-1)).toEqual({ where: { id: "t1" }, data: { daemon: null, thread: newest.id } });
    specimen.expect(threads.$entities.get()).not.toContain(thread);
    terminal.$buffer.set(buffer);
    specimen.expect(await run("/buffer/delete")).toBe('buffer "memo #1" removed');
    specimen.expect(terminal.buffer).toBe(null);
    specimen.expect(buffers.$entities.get()).not.toContain(buffer);
    specimen.expect(await fault("/buffer/delete")).toBe(undefined);
  });
});
