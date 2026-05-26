import { Pipe, Queue, fn } from "@vivalence/typology";

async function relay(readable, pipe) {
  try {
    let rest = "";
    for await (const chunk of readable.pipeThrough(new TextDecoderStream())) {
      const lines = (rest + chunk).split("\n");
      rest = lines.pop();
      for (const line of lines) pipe.send(line);
    }
    if (rest) pipe.send(rest);
  } catch { /* stream closed */ }
}

async function feed(queue, writable) {
  const encoder = new TextEncoder();
  const writer = writable.getWriter();
  try {
    for await (const line of queue.drain()) await writer.write(encoder.encode(line + "\n"));
    await writer.close();
  } catch { /* stream closed */ }
}

class Lock {
  constructor(paladin, path) {
    this.paladin = paladin;
    this.path = path;
  }
  write(record) {
    return this.paladin.state.json(this.path, record);
  }
  read() {
    return this.paladin.read.json(this.path, null);
  }
  remove() {
    return this.paladin.state.remove(this.path);
  }
  async alive() {
    const lock = await this.read();
    if (!lock) return false;
    try {
      Deno.kill(lock.pid, "SIGCONT");
      return true;
    } catch {
      return false;
    }
  }
}

class Log {
  constructor(paladin, path) {
    this.paladin = paladin;
    this.path = path;
  }
  append(span) {
    return this.paladin.state.jsonl(this.path.branch("spans.jsonl"), span.json);
  }
  open(stream) {
    return this.paladin.state.open(this.path.branch(`${stream}.log`));
  }
}

class Instances {
  constructor(paladin, path) {
    this.paladin = paladin;
    this.path = path;
  }
  async read(slug) {
    return (await this.paladin.read.json(this.path, {}))[slug] ?? null;
  }
  async write(slug, partial) {
    const all = await this.paladin.read.json(this.path, {});
    const now = new Date().toISOString();
    all[slug] = { ...(all[slug] ?? { createdAt: now }), ...partial, updatedAt: now };
    await this.paladin.state.json(this.path, all);
  }
}

class Process {
  constructor(system, spec) {
    this.system = system;
    this.spec = spec;
    this.lock = system.lock(spec.type, spec.slug);
  }

  async spawn() {
    const [bin, ...args] = this.spec.cmd;
    const piped = !this.spec.detached;

    this.child = new Deno.Command(bin, {
      args,
      cwd: this.spec.cwd,
      env: this.spec.env,
      clearEnv: this.spec.clearEnv ?? false,
      stdin: piped ? "piped" : "null",
      stdout: piped ? "piped" : "null",
      stderr: piped ? "piped" : "null",
    }).spawn();

    if (piped) {
      this.out = new Pipe();
      this.err = new Pipe();
      this.in = new Queue();
      relay(this.child.stdout, this.out);
      relay(this.child.stderr, this.err);
      feed(this.in, this.child.stdin);
    }

    await this.lock.write({
      pid: this.child.pid,
      type: this.spec.type,
      slug: this.spec.slug,
      mount: this.spec.mount,
      started: new Date().toISOString(),
    });

    this.child.status.then(() => {
      this.in?.close();
      this.lock.remove();
    });
    if (this.spec.detached) this.child.unref();

    return this;
  }

  get pid() {
    return this.child.pid;
  }

  get status() {
    return this.child.status;
  }

  async kill(signal = "SIGTERM") {
    try {
      this.child.kill(signal);
      await this.child.status;
    } catch {
      try {
        this.child.kill("SIGKILL");
      } catch {
        /* gone */
      }
    }
  }
}

export class System {
  constructor(paladin) {
    this.paladin = paladin;
    this.attached = new Set();
    this.armed = false;
    this.mount = fn.once(this.mount.bind(this));
  }

  async mount() {
    this.instances = new Instances(
      this.paladin,
      this.paladin.scope.system.branch("instances.json"),
    );
    this.pipe = new Pipe();
    this.pipe.tap((span) => this.log("client", "ghost").append(span));
    this.paladin.publish();
    return this;
  }

  lock(type, slug) {
    return new Lock(this.paladin, this.paladin.scope.system.branch(`/locks/${type}_${slug}.lock`));
  }

  log(type, slug) {
    return new Log(this.paladin, this.paladin.scope.system.branch(`/logs/${type}_${slug}`));
  }

  async locks(type) {
    const dir = this.paladin.scope.system.branch(`/locks`);
    const prefix = `${type}_`;
    try {
      const out = [];
      for await (const entry of Deno.readDir(dir.absolute)) {
        if (!entry.name.startsWith(prefix) || !entry.name.endsWith(".lock")) continue;
        const slug = entry.name.slice(prefix.length, -".lock".length);
        out.push({ type, slug, ...(await this.lock(type, slug).read()) });
      }
      return out;
    } catch {
      return [];
    }
  }

  async spawn(spec) {
    const process = await new Process(this, spec).spawn();
    if (!spec.detached) {
      this.arm();
      this.attached.add(process);
      process.status.then(() => this.attached.delete(process));
    }
    return process;
  }

  async kill(type, slug) {
    const lock = await this.lock(type, slug).read();
    if (!lock) return null;
    try {
      Deno.kill(lock.pid, "SIGTERM");
    } catch {
      /* gone */
    }
    await this.lock(type, slug).remove();
    return lock.pid;
  }

  arm() {
    if (this.armed) return;
    this.armed = true;
    for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
      Deno.addSignalListener(signal, () => this.teardown(signal));
    }
  }

  async teardown(signal) {
    await Promise.all([...this.attached].map((process) => process.kill()));
    Deno.exit(signal === "SIGINT" ? 130 : 0);
  }
}
