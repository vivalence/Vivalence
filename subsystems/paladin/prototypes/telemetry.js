import { control, fn, Pattern, Signal, Span, sse, trace, v } from "@vivalence/typology";

const natures = (signature) => signature.array.filter((segment) => segment.nature != null);

const REACHES = [
  [
    (segments) => segments.length > 0 && segments.at(-1).type === "remainder",
    (segments) => ({ segments: segments.slice(0, -1), reaches: (held, given) => held < given }),
  ],
  [() => true, (segments) => ({ segments, reaches: (held, given) => held === given })],
];

const literal = (segment) => segment.type === "literal";

const heavier = (a, b) =>
  b.segments.length - a.segments.length ||
  b.segments.filter(literal).length - a.segments.filter(literal).length ||
  a.reaches(0, 1) - b.reaches(0, 1);

export const ranked = (sieve) =>
  Object.entries(sieve)
    .map(([key, tracks]) => {
      const segments = natures(new Pattern(key));
      return { key, tracks, ...REACHES.find(([test]) => test(segments))[1](segments) };
    })
    .sort(heavier);

const fits = (signals) => (entry) =>
  entry.reaches(entry.segments.length, signals.length) &&
  entry.segments.every((segment, index) => segment.apply(signals[index]) !== null);

export const held = (order, record) => {
  const signals = natures(new Signal(`/${trace.pathname(record.path)}`));
  const entry = order.find(fits(signals));
  if (entry === undefined || !entry.tracks.includes(record.track)) return null;
  return Object.assign(
    {},
    ...entry.segments.map((segment, index) => segment.apply(signals[index]).parameters),
  );
};

const names = (text) => [...text.matchAll(/:([a-z]+)/g)].map(([, name]) => name);

export const fill = (target, parameters) =>
  target.replace(/:([a-z]+)/g, (_, name) => parameters[name]);

const KINDS = {
  console: (target) => target === "console",
  file: (target) => target.endsWith(".jsonl"),
  socket: (target) => target === "socket",
};

export const faults = (telemetry) =>
  Object.entries(telemetry.logger).flatMap(([target, sieve]) => [
    ...(Object.values(KINDS).some((kind) => kind(target))
      ? []
      : [`telemetry.logger.${target} is neither "console" nor "socket" nor a .jsonl path`]),
    ...Object.keys(sieve).flatMap((path) =>
      names(target)
        .filter((name) => !names(path).includes(name))
        .map((name) => `telemetry.logger.${target} ${path} binds no :${name}`),
    ),
  ]);

const plain = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const pairs = (data) =>
  Object.entries(data)
    .map(([key, value]) => `${key} ${told(value)}`)
    .join(" · ");

const TOLD = [
  [(value) => typeof value === "string", (value) => value],
  [Array.isArray, (value) => `[${value.map(told).join(", ")}]`],
  [plain, (value) => `{${pairs(value)}}`],
  [() => true, (value) => JSON.stringify(value)],
];

const told = (value) => TOLD.find(([test]) => test(value))[1](value);

const roomy = (value) => plain(value) && Object.keys(value).length > 0;

const keyed = (data) => {
  const width = Math.max(...Object.keys(data).map((key) => key.length));
  return Object.entries(data)
    .map(([key, value]) => `${key.padEnd(width)}  ${roomy(value) ? pairs(value) : told(value)}`)
    .join("\n");
};

const LOGGED = [
  [(data) => typeof data === "string", (data) => data],
  [(data) => Object.values(data).some(roomy), keyed],
  [() => true, pairs],
];

const SAID = {
  start: () => "",
  stop: () => "",
  request: (data) => `${data.method ?? ""} ${data.path ?? ""}`,
  response: (data) => `${data.status ?? ""}`,
  fault: (data) =>
    [`${data.type}: ${data.message}`, ...(data.stack ?? "").split("\n").slice(1)].join("\n"),
  log: (data) => LOGGED.find(([test]) => test(data))[1](data),
  entity: (data) => `${data.schema} ${data.id}`,
  status: (data) => data.code,
  usage: (data) =>
    [
      Object.values(data.subject).join(" "),
      data.state ?? "…",
      ...data.measures.map((measure) => `${measure.name} ${measure.amount} ${measure.unit}`),
    ].join(" · "),
};

const KIND = {
  runtime: ["r", 1],
  daemon: ["d", 1],
  mode: ["m", 2],
  client: ["c", 1],
  service: ["s", 1],
  aperture: ["a", 0],
  harness: ["h", 0],
  entities: ["e", 0],
  metadata: ["md", 0],
  userspace: ["u", 0],
};

const kinded = (words) => {
  if (words.length === 0) return [];
  const [word, ...rest] = words;
  if (!(word in KIND) || rest.length === 0) return [word, ...kinded(rest)];
  const [short, slugs] = KIND[word];
  return [short, ...rest.slice(0, slugs), ...kinded(rest.slice(slugs))];
};

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;

const brief = (pathname) =>
  kinded(pathname.replace(UUID, (id) => id.slice(0, 8)).split("/")).join("/");

const two = (value) => String(value).padStart(2, "0");

const clock = (at) => {
  const date = new Date(at);
  const seconds = `${two(date.getHours())}:${two(date.getMinutes())}:${two(date.getSeconds())}`;
  return `${seconds}.${String(date.getMilliseconds()).padStart(3, "0")}`;
};

const BROKEN = ["request", "response", "log", "fault"];

const below = (said) =>
  said
    .split("\n")
    .map((row) => `\n│ ${row.trim()}`)
    .join("");

const beside = (said) => `  │  ${said}`;

export const line = (record) => {
  const path = brief(trace.pathname(record.path));
  const head = `${clock(record.at)} ${record.track.padEnd(8)} ${path}`;
  const said = SAID[record.track](record.data);
  if (said === "") return head;
  return head + (BROKEN.includes(record.track) ? below(said) : beside(said));
};

const ordered = (logger, kind) =>
  Object.entries(logger)
    .filter(([target]) => kind(target))
    .map(([target, sieve]) => ({ target, order: ranked(sieve) }));

const sink = (loggers, write) => (record) =>
  Promise.all(
    loggers.map((logger) => {
      const parameters = held(logger.order, record);
      return parameters === null ? null : write(fill(logger.target, parameters), record);
    }),
  );

const print = (target, record) => console[record.track === "fault" ? "error" : "log"](line(record));

const KEPT = 1000;
const QUIET = 1500;
const REREAD = 500;

export class Telemetry {
  kept = {};
  settles = {};
  controller = null;
  attached = null;
  span = null;
  listening = null;

  constructor(paladin) {
    this.paladin = paladin;
  }

  get logs() {
    return this.paladin.ledger.log(this.paladin.instance.manifest.slug).base;
  }

  append(target, record) {
    return this.paladin.state.jsonl(this.logs.branch(target), record);
  }

  drain(target) {
    localStorage.setItem(
      `viva.telemetry.${target}`,
      this.kept[target].map((row) => JSON.stringify(row)).join("\n"),
    );
  }

  keep(target, record) {
    const rows = (this.kept[target] ??= []);
    rows.push(record);
    rows.splice(0, rows.length - KEPT);
    if (record.track === "fault") return this.drain(target);
    (this.settles[target] ??= fn.debounce(() => this.drain(target), QUIET))();
  }

  get console() {
    return sink(ordered(this.paladin.instance.telemetry.logger, KINDS.console), print);
  }

  get file() {
    const write = this.paladin.is.browser
      ? (target, record) => this.keep(target, record)
      : (target, record) => this.append(target, record);
    return sink(ordered(this.paladin.instance.telemetry.logger, KINDS.file), write);
  }

  get socket() {
    const send = (target, record) => this.send(record);
    return sink(ordered(this.paladin.instance.telemetry.logger, KINDS.socket), send);
  }

  follow(controller) {
    this.controller = controller;
    return this.attach();
  }

  attach() {
    if (this.attached || !this.controller || !this.paladin.instance.telemetry) return this.attached;
    const { stdout } = this.controller;
    stdout.history.forEach(this.console);
    stdout.history.forEach(this.file);
    stdout.pipe.tap(this.console);
    stdout.pipe.tap(this.file);
    if (!this.paladin.is.browser) {
      stdout.history.forEach(this.socket);
      stdout.pipe.tap(this.socket);
    }
    this.attached = true;
    return this.attached;
  }

  send(record) {
    this.span ??= this.listen(new Span("socket"));
    this.span.pipe.send(record);
  }

  listen(span) {
    const { stdout } = this.controller;
    const [root] = trace.pathname(stdout.absolute).split("/");
    const path = this.logs.branch(`${root}.${Deno.pid}.sock`).absolute;
    this.paladin.state
      .dir(this.logs)
      .then(() => this.accept(Deno.listen({ transport: "unix", path }), span))
      .catch((error) => stdout.log({ socket: path, refused: error.message }));
    return span;
  }

  async accept(listener, span) {
    const { stdout } = this.controller;
    const { path } = listener.addr;
    this.listening = path;
    globalThis.addEventListener("unload", () => {
      try {
        Deno.removeSync(path);
      } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) throw error;
      }
    });
    control.hold(this.controller).then(() => listener.close());
    for await (const connection of listener) {
      sse
        .encode(span.drain())
        .pipeTo(connection.writable)
        .catch((error) => {
          if (!(error instanceof Deno.errors.BrokenPipe)) stdout.fault(error);
        });
    }
  }

  async watch(logger, stopped) {
    const { Telemetry: schematic } = v.primitives.instance;
    const wrong = [
      ...schematic.faults({ logger }).map(({ at, reason }) => `${at} ${reason}`),
      ...faults({ logger }),
    ];
    if (wrong.length) throw new Error(wrong.join(" · "));
    const { slug } = this.paladin.instance.manifest;
    if (!Object.keys(this.paladin.instance.telemetry.logger).some(KINDS.socket)) {
      throw new Error(`no process of ${slug} sends: its recipe names no telemetry.logger.socket`);
    }
    const write = (target, record) => this.append(target, record);
    const span = new Span("watched");
    span.pipe.tap(sink(ordered(logger, KINDS.console), print));
    span.pipe.tap(sink(ordered(logger, KINDS.file), write));
    await this.paladin.state.dir(this.logs);
    const dialed = new Set();
    const dial = async (path) => {
      dialed.add(path);
      try {
        const connection = await Deno.connect({ transport: "unix", path });
        span.pipe.from(sse.frames(connection.readable));
      } catch (error) {
        const gone = [Deno.errors.ConnectionRefused, Deno.errors.NotFound];
        if (!gone.some((kind) => error instanceof kind)) throw error;
      }
    };
    const reread = async () => {
      const entries = await Array.fromAsync(Deno.readDir(this.logs.absolute));
      const paths = entries
        .filter((entry) => entry.name.endsWith(".sock"))
        .map((entry) => this.logs.branch(entry.name).absolute)
        .filter((path) => path !== this.listening && !dialed.has(path));
      await Promise.all(paths.map(dial));
    };
    await reread();
    const rereading = setInterval(reread, REREAD);
    try {
      await stopped;
    } finally {
      clearInterval(rereading);
    }
  }
}
