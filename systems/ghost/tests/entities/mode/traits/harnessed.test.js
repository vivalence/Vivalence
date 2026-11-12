import { Connection, shape, specimen, steer, Url, Vector } from "@vivalence/typology";
import { HARNESSED } from "../../../../entities/mode/traits/harnessed.js";

const runtime = (ear, voice = false) => {
  const harness = new Vector();
  harness.branch("/dialogue").open("stream", () => null);
  if (ear) harness.branch("/verbatim").open("stream", () => null);
  if (voice) harness.branch("/call").open("stream", () => null);
  return shape.strip(harness);
};

const attached = async (ear, voice) => {
  const mode = { connection: new Connection(new Url("http://probe.invalid"), {}), metadata: {}, repl: new Vector() };
  mode.connection.call = async () => ({ references: runtime(ear, voice) });
  await HARNESSED(mode, { client: { runtime: { entities: { em: { repositoryMap: {} } } } } });
  return { mode, lines: steer.trie.leaves(mode.repl).map((entry) => `/${entry.steps.map((step) => step.nature).join("/")}`) };
};

specimen.describe("ghost HARNESSED — no ear, no route, no command (S5 · T-absent)", () => {
  specimen.it("a runtime harness with /verbatim grafts /dictate and its exits on the mode's repl", async () => {
    const { mode, lines } = await attached(true);
    specimen.expect(typeof mode.harness.verbatim.stream).toBe("function");
    for (const line of ["/dictate", "/dictate/stop", "/dictate/send", "/dictate/trash", "/polish/engaged", "/mic"]) specimen.expect(lines).toContain(line);
  });

  specimen.it("a runtime harness without /verbatim: no /dictate at all, nothing throws", async () => {
    const { mode, lines } = await attached(false);
    specimen.expect(mode.harness.verbatim).toBe(undefined);
    specimen.expect(lines.filter((line) => ["/dictate", "/polish", "/mic", "/call"].some((head) => line.startsWith(head)))).toEqual([]);
    specimen.expect(lines).toContain("/harness");
  });

  specimen.it("a runtime harness with /call grafts /call and /call/end; without it, none", async () => {
    const voiced = await attached(true, true);
    for (const line of ["/call", "/call/end"]) specimen.expect(voiced.lines).toContain(line);
    const mute = await attached(true, false);
    specimen.expect(mute.lines.filter((line) => line.startsWith("/call"))).toEqual([]);
  });
});
