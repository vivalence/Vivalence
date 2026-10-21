// m93 tangle departure 4 · Q7: the host's status beat owns its failure — it sets $status ERROR and rethrows (the vector settles FAILED, no .catch at the caller); the /status subscription marks loss and recovery only.
import { atom } from "nanostores";
import { Aperture, specimen } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";

const stub = (answer) => {
  const taps = [];
  const closed = [];
  const runtime = {
    $status: atom({ code: "IDLE" }),
    aperture: {
      call: (path) => answer(path),
      branch: (path) => ({
        subscribe: (route, callback, options) => {
          taps.push({ path, route, callback, options });
          return () => closed.push(path);
        },
      }),
    },
  };
  return { die: { runtime }, taps, closed };
};

specimen.describe("host.status — the beat owns its failure and its subscription", () => {
  specimen.it("a /status call that fails sets ERROR with the error and rethrows; nothing is subscribed", async () => {
    const refused = new Error("refused");
    const { die, taps } = stub(() => Promise.reject(refused));
    let passed = false;
    await specimen.expect(ghost.shard.host.status("runtime")(die, async () => (passed = true))).rejects.toThrow("refused");
    specimen.expect(die.runtime.$status.get()).toEqual({ code: "ERROR", error: refused });
    specimen.expect(passed).toBe(false);
    specimen.expect(taps).toEqual([]);
  });

  specimen.it("a /status answer is the status; the subscription marks UNAVAILABLE on loss or drop and HEALTHY again on RUNNING; the tap closes after next", async () => {
    const { die, taps, closed } = stub(async () => ({ code: "RUNNING" }));
    const seen = [];
    const beat = ghost.shard.host.status("runtime")(die, async () => {
      seen.push(die.runtime.$status.get().code);
      const [tap] = taps;
      specimen.expect([tap.path, tap.route]).toEqual(["/status", "/subscribe"]);
      tap.callback({ code: "RUNNING" });
      seen.push(die.runtime.$status.get().code);
      tap.callback({ code: "STOPPED" });
      seen.push(die.runtime.$status.get().code);
      tap.callback({ code: "RUNNING" });
      seen.push(die.runtime.$status.get().code);
      tap.options.dropped();
      seen.push(die.runtime.$status.get().code);
      specimen.expect(closed).toEqual([]);
    });
    await beat;
    specimen.expect(seen).toEqual(["RUNNING", "RUNNING", "UNAVAILABLE", "HEALTHY", "UNAVAILABLE"]);
    specimen.expect(closed).toEqual(["/status"]);
  });
});

specimen.describe("host.mounted — a remote mode staggers the HOST catalog: LOOPING is the client's own trait, absent here", () => {
  specimen.it("a host-staggered mode declaring LOOPING mounts without throwing and grafts no /terminal/:terminal/repl onto the client", async () => {
    const mode = { manifest: { traits: ["LOOPING"] }, reference: { absolute: "/runtime/runtime/mode/home/remote" } };
    const messages = [];
    const die = {
      runtime: { $status: atom({ code: "MOUNTING" }), modes: [mode], reference: { absolute: "/runtime/runtime" } },
      client: { aperture: new Aperture() },
      controller: { stdout: { log: (message) => messages.push(message) } },
    };
    let passed = false;
    await ghost.shard.host.mounted("runtime")(die, async () => (passed = true));
    specimen.expect(passed).toBe(true);
    specimen.expect([...die.client.aperture.trie.keys()]).toEqual([]);
    specimen.expect(messages).toEqual([{ runtime: "/runtime/runtime", modes: ["/runtime/runtime/mode/home/remote"] }]);
    specimen.expect(die.runtime.$status.get()).toEqual({ code: "RELEASED" });
  });
});
