import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Controller, Path, Span, v } from "@vivalence/typology";
import { faults, fill, held, line, ranked, Telemetry } from "../prototypes/telemetry.js";
import { Instance } from "../instance/prototype.js";

const { Telemetry: Schematic } = v.primitives.instance;

const AMEN = {
  logger: {
    console: { "/(.*)": ["status", "fault"] },
    "spans.jsonl": { "/(.*)": ["status", "fault", "log"] },
    "daemons/:daemon.jsonl": {
      "/runtime/runtime/daemon/:daemon/(.*)": ["start", "stop", "status", "fault", "log"],
    },
  },
};

const record = (pathname, track, data = null) => ({ at: 0, path: [pathname], track, data });

const paladin = (telemetry, { browser = false, logs = "/ledger/logs" } = {}) => {
  const appended = [];
  const stub = {
    instance: { manifest: { slug: "probe" }, telemetry },
    is: { browser },
    ledger: { log: (slug) => ({ base: new Path(`${logs}/${slug}`) }) },
    state: {
      jsonl: (path, entry) => appended.push([path.absolute, entry.track]),
      dir: (path) => Deno.mkdir(path.absolute, { recursive: true }),
    },
  };
  return { stub, appended, telemetry: new Telemetry(stub) };
};

const boot = (taps) => {
  const runtime = new Controller({ stdout: new Span("runtime/runtime") });
  for (const tap of taps) runtime.stdout.pipe.tap(tap);
  runtime.start();
  const daemon = runtime.branch("/daemon/droneaid");
  daemon.start();
  const mode = daemon.branch("/mode/model/editor");
  mode.start();
  const call = mode.stdout.branch("aperture/geometry/63638210-43de-4263-9f8a-fb4d26b5972b");
  call.start();
  call.request({ method: "POST", path: "/daemon/droneaid/mode/model/editor/geometry" });
  call.response({ status: 200 });
  call.stop();
  daemon.stdout.log("seated on probe");
  mode.fault(new TypeError("The database connection is not open"));
  return runtime;
};

const printing = (run) => {
  const printed = [];
  const { log, error } = console;
  console.log = (text) => printed.push(["log", text]);
  console.error = (text) => printed.push(["error", text]);
  try {
    run();
  } finally {
    Object.assign(console, { log, error });
  }
  return printed;
};

describe("the sieve — a key is a record's path, its value the tracks admitted there", () => {
  const order = ranked({
    "/(.*)": ["status", "fault", "log"],
    "/runtime/runtime/daemon/*/mode/model/editor": ["status", "fault", "log"],
    "/runtime/runtime/daemon/*/mode/model/editor/(.*)": ["request", "response", "fault", "log"],
    "/ghost/client/terminal/*/repl": ["log", "fault"],
  });
  const winner = (pathname) => order.find((entry) => held([entry], record(pathname, entry.tracks[0])) !== null)?.key;

  it("the most specific key wins, whatever order the keys were written in", () => {
    expect(winner("runtime/runtime")).toBe("/(.*)");
    expect(winner("runtime/runtime/daemon/droneaid/mode/model/editor")).toBe("/runtime/runtime/daemon/*/mode/model/editor");
    expect(winner("runtime/runtime/daemon/droneaid/mode/model/editor/aperture/geometry/f2")).toBe(
      "/runtime/runtime/daemon/*/mode/model/editor/(.*)",
    );
    expect(winner("ghost/client/terminal/6f1c/repl")).toBe("/ghost/client/terminal/*/repl");
    expect(winner("ghost/client/terminal/6f1c/repl/close")).toBe("/(.*)");
  });

  it("a plain key matches exactly its own path; a trailing (.*) takes one or more below it", () => {
    const plain = ranked({ "/x": ["log"] });
    const below = ranked({ "/x/(.*)": ["log"] });
    expect(held(plain, record("x", "log"))).toEqual({});
    expect(held(plain, record("x/a", "log"))).toBe(null);
    expect(held(below, record("x", "log"))).toBe(null);
    expect(held(below, record("x/a", "log"))).toEqual({});
    expect(held(below, record("x/a/b", "log"))).toEqual({});
  });

  it("the winning key's tracks decide; a track it does not name is refused", () => {
    expect(held(order, record("runtime/runtime/daemon/droneaid/mode/model/editor/geometry/f1", "request"))).toEqual({});
    expect(held(order, record("runtime/runtime/daemon/droneaid/mode/model/editor/geometry/f1", "status"))).toBe(null);
    expect(held(order, record("runtime/runtime", "request"))).toBe(null);
  });

  it("a :name in a key binds, and fills the same :name in its target", () => {
    const captured = ranked(AMEN.logger["daemons/:daemon.jsonl"]);
    const parameters = held(captured, record("runtime/runtime/daemon/droneaid/mode/model/editor", "status"));
    expect(parameters).toEqual({ daemon: "droneaid" });
    expect(fill("daemons/:daemon.jsonl", parameters)).toBe("daemons/droneaid.jsonl");
  });
});

describe("v.primitives.instance.Telemetry — the recipe's word", () => {
  const sentences = (value) => Schematic.faults(value).map(({ at, reason }) => `${at} ${reason}`);

  it("his amen'd object passes, schematic and capture", () => {
    expect(sentences(AMEN)).toEqual([]);
    expect(faults(AMEN)).toEqual([]);
  });

  it("a key off the root, a bare string for the tracks and an unknown track are loud", () => {
    expect(sentences({ logger: { console: { "a/b": ["fault"] } } })).toEqual(["/logger/console must not have additional properties"]);
    expect(sentences({ logger: { console: { "/(.*)": "fault" } } })).toEqual(["/logger/console//(.*) must be array"]);
    expect(sentences({ logger: { console: { "/(.*)": ["payload"] } } }).length).toBeGreaterThan(0);
  });

  it("a recipe that says nothing settles to status · fault · log on the console; logger: {} is declared silence", () => {
    const { InstanceMask } = v.primitives.instance;
    const settled = (held) => InstanceMask.cast({ manifest: { type: "instance", slug: "probe" }, environment: {}, ...held }).telemetry;
    expect(settled({})).toEqual({ logger: { console: { "/runtime/(.*)": ["status", "fault", "log"] } } });
    expect(settled({ telemetry: {} })).toEqual({ logger: { console: { "/runtime/(.*)": ["status", "fault", "log"] } } });
    expect(settled({ telemetry: { logger: {} } })).toEqual({ logger: {} });
  });

  it("the empty Instance presets nothing: a cast over it settles to the default too", () => {
    const { InstanceMask } = v.primitives.instance;
    const empty = Object.assign(new Instance(), { manifest: { type: "instance", slug: "probe" }, environment: {} });
    expect(InstanceMask.cast(empty).telemetry).toEqual({ logger: { console: { "/runtime/(.*)": ["status", "fault", "log"] } } });
  });

  it("a key that binds no :name of its target, and a target of neither kind, are named", () => {
    expect(faults({ logger: { "daemons/:daemon.jsonl": { "/(.*)": ["status"] } } })).toEqual([
      "telemetry.logger.daemons/:daemon.jsonl /(.*) binds no :daemon",
    ]);
    expect(faults({ logger: { stdout: { "/(.*)": ["status"] } } })).toEqual([
      'telemetry.logger.stdout is neither "console" nor "socket" nor a .jsonl path',
    ]);
    expect(faults({ logger: { socket: { "/(.*)": ["status"] } } })).toEqual([]);
  });
});

describe("the console's line — one style", () => {
  it("a status keeps the divider; kind words are short, slugs whole", () => {
    const text = line({ at: 0, path: ["runtime/runtime", "/daemon/droneaid", "/mode/model/editor"], track: "status", data: { code: "RUNNING" } });
    expect(text.slice(13)).toBe("status   r/runtime/d/droneaid/m/model/editor  │  RUNNING");
  });

  it("request · response · log · fault say it on the row below; an id shows its first 8", () => {
    const path = ["runtime/runtime", "/daemon/droneaid", "aperture/geometry/63638210-43de-4263-9f8a-fb4d26b5972b"];
    const rows = line({ at: 0, path, track: "request", data: { method: "POST", path: "/daemon/droneaid/geometry" } }).split("\n");
    expect(rows[0].slice(13)).toBe("request  r/runtime/d/droneaid/a/geometry/63638210");
    expect(rows[1]).toBe("│ POST /daemon/droneaid/geometry");
    const streamed = line({ at: 0, path: [...path.slice(0, 2), "harness/dialogue/stream"], track: "start", data: null });
    expect(streamed.slice(13)).toBe("start    r/runtime/d/droneaid/h/dialogue/stream");
    const listed = line({ at: 0, path: ["runtime/runtime", "socket", "/userspace/entities/buffer/find"], track: "start", data: null });
    expect(listed.slice(13)).toBe("start    r/runtime/socket/u/e/buffer/find");
    const described = line({ at: 0, path: [...path.slice(0, 2), "metadata/manifest"], track: "start", data: null });
    expect(described.slice(13)).toBe("start    r/runtime/d/droneaid/md/manifest");
    expect(line({ at: 0, path, track: "start", data: null }).split("\n").length).toBe(1);
  });

  it("a fault prints its stack below, one row a frame", () => {
    const rows = line({ at: 0, path: ["runtime/runtime"], track: "fault", data: { type: "TypeError", message: "closed", stack: "TypeError: closed\n    at a (x.js:1:1)" } }).split("\n");
    expect(rows.slice(1)).toEqual(["│ TypeError: closed", "│ at a (x.js:1:1)"]);
  });

  it("a log's object says its keys: scalars on one row, a nested object a row per key", () => {
    const patrol = { service: {}, daemon: { chess: "RUNNING", spanish: "PAUSED" }, files: { missing: [], returned: ["a.mp3"] } };
    const rows = line({ at: 0, path: ["runtime/runtime"], track: "log", data: patrol }).split("\n");
    expect(rows.slice(1)).toEqual([
      "│ service  {}",
      "│ daemon   chess RUNNING · spanish PAUSED",
      "│ files    missing [] · returned [a.mp3]",
    ]);
    const dropped = line({ at: 0, path: ["runtime/runtime", "socket"], track: "log", data: { drop: "no-route", signal: "/x/y" } });
    expect(dropped.split("\n").slice(1)).toEqual(["│ drop no-route · signal /x/y"]);
    const deep = line({ at: 0, path: ["runtime/runtime"], track: "log", data: { listen: { at: { port: 2501 } }, live: true } });
    expect(deep.split("\n").slice(1)).toEqual(["│ listen  at {port 2501}", "│ live    true"]);
    expect(line({ at: 0, path: ["runtime/runtime"], track: "log", data: "seated on probe" }).split("\n")[1]).toBe("│ seated on probe");
  });
});

describe("paladin.telemetry — a process taps the sinks it can show", () => {
  it("the console sink prints the admitted records, a fault on the error stream", () => {
    const { telemetry } = paladin(AMEN);
    const printed = printing(() => boot([telemetry.console]));
    expect(printed.map(([stream]) => stream)).toEqual(["log", "log", "log", "log", "error"]);
    expect(printed.at(-1)[1].split("\n")[1]).toBe("│ TypeError: The database connection is not open");
  });

  it("the file sink appends under the instance's logs, one file per capture", () => {
    const { telemetry, appended } = paladin(AMEN);
    boot([telemetry.file]);
    const count = (path) => appended.filter(([held]) => held === path).length;
    expect(count("/ledger/logs/probe/spans.jsonl")).toBe(6);
    expect(count("/ledger/logs/probe/daemons/droneaid.jsonl")).toBe(6);
    expect(appended.length).toBe(12);
  });

  it("a process that taps only the file prints nothing; one that taps only the console writes nothing", () => {
    const filed = paladin(AMEN);
    expect(printing(() => boot([filed.telemetry.file]))).toEqual([]);
    const shown = paladin(AMEN);
    printing(() => boot([shown.telemetry.console]));
    expect(shown.appended).toEqual([]);
  });

  it("in a browser a file's rows are kept, drained at once on a fault", () => {
    const stored = new Map();
    const held = globalThis.localStorage;
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { setItem: (key, text) => stored.set(key, text) } });
    try {
      const { telemetry, appended } = paladin(AMEN, { browser: true });
      boot([telemetry.file]);
      expect(appended).toEqual([]);
      expect(telemetry.kept["spans.jsonl"].length).toBe(6);
      expect(stored.get("viva.telemetry.spans.jsonl").split("\n").length).toBe(6);
      expect(JSON.parse(stored.get("viva.telemetry.spans.jsonl").split("\n").at(-1)).track).toBe("fault");
      for (const settle of Object.values(telemetry.settles)) settle.cancel();
    } finally {
      Object.defineProperty(globalThis, "localStorage", { configurable: true, value: held });
    }
  });

  it("a watching logger is checked by the recipe's own law, before any socket is read", async () => {
    const { telemetry } = paladin(AMEN);
    await expect(telemetry.watch({ console: { "a/b": ["status"] } })).rejects.toThrow(
      "/logger/console must not have additional properties",
    );
    await expect(telemetry.watch({ stdout: { "/(.*)": ["status"] } })).rejects.toThrow(
      'telemetry.logger.stdout is neither "console" nor "socket" nor a .jsonl path',
    );
    await expect(telemetry.watch({ console: { "/(.*)": ["status"] } })).rejects.toThrow(
      "no process of probe sends: its recipe names no telemetry.logger.socket",
    );
  });

  it("a followed root writes by the recipe, the past included", async () => {
    const logs = await Deno.makeTempDir({ prefix: "viva-" });
    const { telemetry, appended } = paladin(AMEN, { logs });
    const runtime = boot([]);
    const printed = [];
    const { log, error } = console;
    console.log = (text) => printed.push(text);
    console.error = (text) => printed.push(text);
    try {
      await telemetry.follow(runtime);
      runtime.stdout.log("after the follow");
      await runtime.kill("SIGTERM");
      await new Promise((resolve) => setTimeout(resolve, 100));
    } finally {
      Object.assign(console, { log, error });
    }
    expect(printed.filter((text) => text.includes("RUNNING")).length).toBe(3);
    expect(appended.filter(([path]) => path === `${logs}/probe/spans.jsonl`).length).toBeGreaterThanOrEqual(7);
    expect(appended.some(([path]) => path === `${logs}/probe/daemons/droneaid.jsonl`)).toBe(true);
    await Deno.remove(logs, { recursive: true });
  });

  it("a root handed over before its instance settles is written once the instance does", async () => {
    const logs = await Deno.makeTempDir({ prefix: "viva-" });
    const { telemetry, stub, appended } = paladin(undefined, { logs });
    const runtime = boot([]);
    expect(telemetry.follow(runtime)).toBe(null);
    expect(appended).toEqual([]);
    stub.instance.telemetry = { logger: { "spans.jsonl": AMEN.logger["spans.jsonl"] } };
    await telemetry.attach();
    expect(appended.length).toBe(6);
    await runtime.kill("SIGTERM");
    await new Promise((resolve) => setTimeout(resolve, 100));
    await Deno.remove(logs, { recursive: true });
  });

  it("a recipe with no socket logger opens no socket file", async () => {
    const logs = await Deno.makeTempDir({ prefix: "viva-" });
    const { telemetry } = paladin({ logger: { console: { "/(.*)": ["entity"] } } }, { logs });
    const runtime = new Controller({ stdout: new Span("runtime/runtime") });
    await telemetry.follow(runtime);
    runtime.start();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(telemetry.span).toBe(null);
    expect(await Array.fromAsync(Deno.readDir(logs))).toEqual([]);
    await Deno.remove(logs, { recursive: true });
  });

  it("a socket path past the limit is one log on the root, never a throw", async () => {
    const root = await Deno.makeTempDir({ prefix: "viva-" });
    const recipe = { logger: { socket: { "/(.*)": ["status"] } } };
    const { telemetry } = paladin(recipe, { logs: `${root}/${"deep".repeat(40)}` });
    const runtime = new Controller({ stdout: new Span("runtime/runtime") });
    await telemetry.follow(runtime);
    runtime.start();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(runtime.stdout.history.filter((record) => record.track === "log" && record.data.refused).length).toBe(1);
    expect(telemetry.listening).toBe(null);
    await Deno.remove(root, { recursive: true });
  });

  it(
    "a socket logger sends what its sieve admits: a listening logger opens on the past, follows, and joins a process that comes later",
    { sanitizeOps: false, sanitizeResources: false },
    async () => {
      const logs = await Deno.makeTempDir({ prefix: "viva-" });
      const recipe = { logger: { socket: { "/(.*)": ["log"] } } };
      const first = paladin(recipe, { logs });
      const runtime = new Controller({ stdout: new Span("runtime/runtime") });
      runtime.start();
      runtime.stdout.log("before the follow");
      await first.telemetry.follow(runtime);
      const caller = paladin(recipe, { logs });
      const sieve = { "/(.*)": ["log", "status"] };
      const stopped = Promise.withResolvers();
      const printed = [];
      const { log } = console;
      console.log = (text) => printed.push(text.split("\n")[1]);
      try {
        const screen = caller.telemetry.watch({ console: sieve }, stopped.promise);
        const file = caller.telemetry.watch({ "calls.jsonl": sieve }, stopped.promise);
        await new Promise((resolve) => setTimeout(resolve, 200));
        runtime.stdout.log("after the listener joined");
        const second = paladin(recipe, { logs });
        const shell = new Controller({ stdout: new Span("ghost/shell") });
        await second.telemetry.follow(shell);
        shell.start();
        shell.stdout.log("from the process that came later");
        await new Promise((resolve) => setTimeout(resolve, 900));
        stopped.resolve();
        await Promise.all([screen, file]);
      } finally {
        Object.assign(console, { log });
      }
      expect(printed).toEqual([
        "│ before the follow",
        "│ after the listener joined",
        "│ from the process that came later",
      ]);
      expect(caller.appended).toEqual([
        [`${logs}/probe/calls.jsonl`, "log"],
        [`${logs}/probe/calls.jsonl`, "log"],
        [`${logs}/probe/calls.jsonl`, "log"],
      ]);
      await Deno.remove(logs, { recursive: true });
    },
  );
});
