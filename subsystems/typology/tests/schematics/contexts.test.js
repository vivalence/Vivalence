import { specimen, contexts, Signal, Vector } from "@vivalence/typology";

const command = () => ({
  input: undefined,
  request: {},
  response: {},
  params: {},
  steps: [],
  signal: new Signal("help"),
  view: { interactive: false, stdin: null, json: false, width: () => 80, painted: false, emit: () => {}, hold: () => {} },
  flags: ["--json"],
});

const controller = { controller: { stdin: new Vector(), stdout: {}, abort: new AbortController(), status: {}, children: [] } };

specimen.describe("contexts.Command · Shell · Repl · Mode", () => {
  specimen.it("the four sets name their words, each with an Example", () => {
    specimen.expect(Object.keys(contexts.Command)).toEqual(["input", "output", "request", "response", "params", "steps", "signal", "view", "flags"]);
    specimen.expect(Object.keys(contexts.Shell)).toEqual([...Object.keys(contexts.Command), "shell", "controller", "instance", "upgrade"]);
    specimen.expect(Object.keys(contexts.Repl)).toEqual([...Object.keys(contexts.vector), "client", "controller", "repl", "runtime", "terminal"]);
    specimen.expect(Object.keys(contexts.Mode)).toEqual(["terminal"]);
    for (const set of [contexts.Shell, contexts.Repl]) {
      for (const [word, schema] of Object.entries(set)) if (!Object.hasOwn(contexts.vector, word)) specimen.expect(schema.description, word).toMatch(/Example: /);
    }
  });

  specimen.it("Shell accepts a shell line's context, instance absent or present", () => {
    const Shell = contexts.of(contexts.Shell);
    const ctx = { ...command(), ...controller, shell: new Vector(), upgrade: { repl: () => {}, chrome: () => {} } };
    specimen.expect([...Shell.errors(ctx)]).toEqual([]);
    specimen.expect([...Shell.errors({ ...ctx, instance: { runtime: {} } })]).toEqual([]);
  });

  specimen.it("Repl accepts a repl line's context: the vector words, the client, the line's controller, the composed repl; runtime and terminal optional", () => {
    const Repl = contexts.of(contexts.Repl);
    const ctx = { ...command(), client: {}, ...controller, repl: new Vector(), signal: new Signal("*") };
    specimen.expect([...Repl.errors(ctx)]).toEqual([]);
    specimen.expect([...Repl.errors({ ...ctx, runtime: {}, terminal: {} })]).toEqual([]);
  });

  specimen.it("Repl refuses a context missing client", () => {
    const Repl = contexts.of(contexts.Repl);
    const ctx = { ...command(), ...controller, repl: new Vector() };
    const faults = [...Repl.errors(ctx)];
    specimen.expect(faults.length).toBeGreaterThan(0);
    specimen.expect(JSON.stringify(faults)).toMatch(/client/);
  });

  specimen.it("client is ONE word now; the old client bag · Loop set are gone", () => {
    specimen.expect(Object.keys(contexts.client)).toEqual(["client"]);
    specimen.expect(contexts.Loop).toBeUndefined();
  });
});
