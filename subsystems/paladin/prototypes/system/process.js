import { Pipe, Queue } from "@vivalence/typology";
import { TextLineStream } from "@std/streams";

const lines = (stream) =>
  stream.pipeThrough(new TextDecoderStream()).pipeThrough(new TextLineStream());

export class Process {
  constructor(system, spec) {
    this.spec = spec;
    this.lock = system.lock(spec.type, spec.slug);
    this.in = new Queue();
    this.out = new Pipe();
  }

  async spawn() {
    const [bin, ...args] = this.spec.cmd;
    const attachment = this.spec.attachment ?? "inherit";
    const std = { piped: "piped", inherit: "inherit", detached: "null" }[attachment];

    this.child = new Deno.Command(bin, {
      args,
      cwd: this.spec.cwd,
      env: this.spec.env,
      clearEnv: this.spec.clearEnv ?? false,
      stdin: attachment === "piped" ? "piped" : "null",
      stdout: std,
      stderr: std,
    }).spawn();

    await this.lock.write({
      pid: this.child.pid,
      type: this.spec.type,
      slug: this.spec.slug,
      mount: this.spec.mount,
      started: new Date().toISOString(),
    });

    this.child.status.then(() => this.lock.remove());
    if (attachment === "detached") this.child.unref();
    if (attachment === "piped") {
      this.in.to(this.child.stdin);
      this.out.from(lines(this.child.stdout), lines(this.child.stderr));
    }

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
