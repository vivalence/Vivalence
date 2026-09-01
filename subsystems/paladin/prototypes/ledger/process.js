import { Pipe, Queue, Wafer } from "@vivalence/typology";
import { TextLineStream } from "@std/streams";

const lines = (stream) => stream.pipeThrough(new TextDecoderStream()).pipeThrough(new TextLineStream());
const STDIO = { inherit: "inherit", piped: "piped", logged: "piped" };
const ALIVE = /^Status:ALIVE$/;
const encoder = new TextEncoder();

export class Process extends Wafer {
  in = new Queue();
  out = new Pipe();

  get manifest() {
    return { type: "process", slug: this.identity.process };
  }

  async populate() {
    if (!STDIO[this.attachment]) {
      throw new Error(`process ${this.slug}: unknown attachment '${this.attachment}' — inherit | piped | logged`);
    }
    this.status.set("populated");
  }

  async resolve() {
    const std = STDIO[this.attachment];
    const file = this.attachment === "logged"
      ? await this.ledger.log(this.identity.instance).open(this.identity.process, "out")
      : null;
    this.child = new Deno.Command(this.command.bin, {
      args: this.command.args,
      cwd: this.command.cwd,
      env: this.command.env,
      clearEnv: true,
      stdin: std === "piped" ? "piped" : "null",
      stdout: std,
      stderr: std,
    }).spawn();
    if (file) {
      this.out.tap((line) => file.write(encoder.encode(line + "\n")));
      this.child.status.then(() => file.close());
    }
    if (std === "piped") {
      this.in.to(this.child.stdin);
      this.out.from(lines(this.child.stdout), lines(this.child.stderr));
    }
    this.child.status.then((exit) => this.status.set({ code: "EXITED", exit }));
    this.status.set({ code: "SPAWNED", pid: this.child.pid });
  }

  async integrate() {
    const deadline = this.command.deadline ?? 60_000;
    const alive = this.attachment === "inherit"
      ? Promise.resolve()
      : new Promise((resolve) => this.out.tap((line) => ALIVE.test(line.trim()) && resolve()));
    const exited = this.child.status.then((exit) => {
      throw Object.assign(new Error(`${this.slug} exited ${exit.code}`), { exit });
    });
    exited.catch(() => {});
    let timer;
    const late = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${this.slug} not ready after ${deadline} ms`)), deadline);
    });
    try {
      await Promise.race([alive, exited, late]);
    } finally {
      clearTimeout(timer);
    }
    this.status.set("alive");
  }

  async perpetuate() {
    return await this.child.status;
  }

  async disintegrate() {
    if (!this.child || this.status.is(["EXITED", "STOPPING"])) return;
    this.status.set("stopping");
    try {
      this.child.kill("SIGTERM");
    } catch {
      return;
    }
    const grace = new Promise((resolve) => setTimeout(resolve, this.command.grace ?? 5_000, "grace"));
    if ((await Promise.race([this.child.status, grace])) === "grace") {
      try {
        this.child.kill("SIGKILL");
      } catch {
        return;
      }
    }
    await this.child.status;
  }
}
