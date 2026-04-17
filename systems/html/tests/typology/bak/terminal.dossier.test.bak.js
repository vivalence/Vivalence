import { specimen } from "@vivalence/typology";
import { Terminal, TerminalDossier } from "../../src/typology/entities/terminal.js";
import { wireDossier } from "../../src/typology/prototypes/dossier.js";

specimen.describe("TerminalDossier: wiring", () => {
  specimen.it("wireDossier produces a LocalRepository-backed repo", () => {
    const repo = wireDossier(TerminalDossier);
    specimen.expect(repo.kind).toBe(Terminal);
    specimen.expect(typeof repo.hydrate).toBe("function");
  });

  specimen.it("create returns a Terminal instance", async () => {
    const repo = wireDossier(TerminalDossier);
    const terminal = await repo.create({ slug: "home" });
    specimen.expect(terminal).toBeInstanceOf(Terminal);
    specimen.expect(terminal.slug).toBe("home");
    specimen.expect(terminal.id).toBeTruthy();
  });
});

specimen.describe("Terminal: thread getter/setter", () => {
  specimen.it("$thread atom backs thread property", async () => {
    const repo = wireDossier(TerminalDossier);
    const terminal = await repo.create({ slug: "t" });
    specimen.expect(terminal.thread).toBeNull();
    terminal.thread = { id: "thread-1" };
    specimen.expect(terminal.thread).toEqual({ id: "thread-1" });
    specimen.expect(terminal.$thread.get()).toEqual({ id: "thread-1" });
  });

  specimen.it("setting thread notifies subscribers", async () => {
    const repo = wireDossier(TerminalDossier);
    const terminal = await repo.create({ slug: "t" });
    let seen = null;
    terminal.$thread.subscribe((v) => { seen = v; });
    terminal.thread = { id: "x" };
    specimen.expect(seen).toEqual({ id: "x" });
  });
});

specimen.describe("Terminal: toJSON", () => {
  specimen.it("serializes id, slug, daemon, thread id", async () => {
    const repo = wireDossier(TerminalDossier);
    const terminal = await repo.create({ slug: "ser", id: "t1" });
    terminal.daemon = { slug: "test" };
    terminal.thread = { id: "thread-1" };
    specimen.expect(terminal.toJSON()).toEqual({
      id: "t1",
      slug: "ser",
      daemon: "test",
      thread: "thread-1",
    });
  });

  specimen.it("handles null daemon and thread", async () => {
    const repo = wireDossier(TerminalDossier);
    const terminal = await repo.create({ slug: "naked", id: "t2" });
    specimen.expect(terminal.toJSON()).toEqual({
      id: "t2",
      slug: "naked",
      daemon: null,
      thread: null,
    });
  });
});
