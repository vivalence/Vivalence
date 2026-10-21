// m88 stretch three, law 6 — ghost REPLING's remote arm pulls a strip and wires every line back to /repl as a Signal (LOOPING: looping.test.js; the hosted arm: console.test.js)
import { Path, ReplSignal, Vector, shape, specimen, steer } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";

const { REPLING } = ghost.entities.mode.traits;

specimen.describe("REPLING (ghost) — a remote mode pulls its strip once and every line goes back to /repl as the Signal it was", () => {
  const frames = [];
  const declared = shape.strip(
    new Vector()
      .open({ nature: "/hello", valence: "hello. Example: /hello", chord: "leader/h" }, () => null)
      .open({ nature: "/mode/console/whoami", valence: "the terminal's id. Example: /mode/console/whoami" }, () => null),
  );
  const kept = structuredClone(declared);
  const remote = Object.assign(new ghost.entities.mode.Mode(), { type: "home", slug: "console", traits: ["REPLING"], reference: new Path("/runtime/house/mode/home/console") });
  remote.connection = {
    call: async (route, input) => {
      frames.push({ route, input });
      return route === "/metadata/repl" ? declared : { answered: input.pathname, body: input.body, flags: input.flags };
    },
  };

  specimen.it("pulls /metadata/repl once; the strip is kept on mode.metadata.repl; the wired repl carries each declaration; the source is not mutated", async () => {
    await REPLING(remote);
    specimen.expect(frames.map((frame) => frame.route)).toEqual(["/metadata/repl"]);
    specimen.expect(remote.metadata.repl).toBe(declared);
    const wired = shape.strip(remote.repl);
    specimen.expect(wired.branches.hello.effect).toEqual(declared.branches.hello.effect);
    specimen.expect(Object.keys(wired.branches.mode.branches.console.branches)).toEqual(["whoami"]);
    specimen.expect(wired.branches.mode.effect).toBe(undefined);
    specimen.expect(declared).toEqual(kept);
  });

  specimen.it("a line dispatched on the wired repl sends its very Signal to /repl; the remote's answer is the value", async () => {
    const signal = new ReplSignal("/mode/console/whoami ciao --pace=40ms");
    const output = await steer.dispatch.execute(remote.repl, { signal, output: undefined }, signal);
    specimen.expect(frames.at(-1).route).toBe("/repl");
    specimen.expect(frames.at(-1).input).toBe(signal);
    specimen.expect(output).toEqual({ answered: "/mode/console/whoami", body: ["ciao"], flags: { pace: "40ms" } });
  });
});
