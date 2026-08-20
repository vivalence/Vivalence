import { specimen, sleep } from "@vivalence/typology";
import { dictation } from "../src/typology/prototypes/dictation.js";

const pause = (signal, ms) =>
  new Promise((resolve) => {
    const timer = setTimeout(done, ms);
    function done() {
      clearTimeout(timer);
      signal.removeEventListener("abort", done);
      resolve();
    }
    signal.addEventListener("abort", done, { once: true });
  });

function fakeBox(samples) {
  const box = {
    released: false,
    paused: false,
    drivers: { audio: { context: { sampleRate: 16000 } } },
    device: {
      microphone: {
        claim: async () => {},
        pause: () => (box.paused = true),
        release: () => (box.released = true),
        in: {
          stream: async function* (signal) {
            for (const sample of samples) {
              if (signal.aborted) return;
              yield sample;
              await pause(signal, 5);
            }
            if (signal.aborted) return;
            await new Promise((resolve) => signal.addEventListener("abort", resolve, { once: true }));
          },
        },
      },
    },
  };
  return box;
}

function fakeTerminals(events) {
  const captured = {};
  const thread = {
    id: "t1",
    mode: {
      harness: {
        verbatim: {
          stream: (source, options) => {
            captured.options = options;
            return (async function* () {
              const sent = [];
              for await (const frame of source) sent.push(frame);
              captured.sent = sent;
              yield* events(sent);
            })();
          },
        },
      },
    },
  };
  return { terminals: { active: { thread } }, captured };
}

specimen.describe("kajuit dictation prototype", () => {
  specimen.it("streams audio packets up through the mirror and folds events into atoms", async () => {
    const box = fakeBox([new Float32Array([0, 0.5]), new Float32Array([-0.5, 1])]);
    const { terminals, captured } = fakeTerminals((sent) => [
      { event: "/turn/open", turn: { role: "user" } },
      { event: "/verbatim/commit", text: "hello" },
      { event: "/verbatim/partial", transcript: "wor" },
      { event: "/verbatim/final", transcript: `hello world x${sent.length}`, segment: 0 },
      { event: "/turn/close" },
      { event: "/verbatim/polish", transcript: `Hello world x${sent.length}.`, segments: [0] },
    ]);

    const dictaphone = dictation({ terminals, box });
    await dictaphone.start();
    specimen.expect(dictaphone.$active.get()).toBe("listening");

    await sleep.ms(40);
    dictaphone.stop();
    specimen.expect(dictaphone.$active.get()).toBe("settling");
    specimen.expect(box.paused).toBe(true);

    await dictaphone.settled();
    specimen.expect(captured.options.input).toEqual({ thread: "t1" });
    specimen.expect(captured.sent.map((frame) => frame.event)).toEqual(["/audio/packet", "/audio/packet"]);
    specimen.expect(captured.sent[0].rate).toBe(16000);
    specimen.expect(typeof captured.sent[0].audio).toBe("string");
    specimen.expect(captured.sent.map((frame) => frame.pts)).toEqual([0, 2 / 16000]);
    specimen.expect(dictaphone.$committed.get()).toBe("Hello world x2.");
    specimen.expect(dictaphone.$tail.get()).toBe("");
    specimen.expect(dictaphone.$active.get()).toBe("idle");
    specimen.expect(box.released).toBe(true);
  });

  specimen.it("cancel discards state and releases the microphone", async () => {
    const box = fakeBox([new Float32Array([0]), new Float32Array([0]), new Float32Array([0])]);
    const { terminals } = fakeTerminals(() => []);
    const dictaphone = dictation({ terminals, box });
    await dictaphone.start();
    await sleep.ms(10);
    dictaphone.cancel();

    specimen.expect(dictaphone.$active.get()).toBe("idle");
    specimen.expect(dictaphone.$committed.get()).toBe("");
    specimen.expect(dictaphone.$tail.get()).toBe("");
    specimen.expect(box.released).toBe(true);
  });

  specimen.it("a session cancelled while arming never clobbers its successor", async () => {
    const claims = [];
    const box = fakeBox([new Float32Array([0]), new Float32Array([0]), new Float32Array([0])]);
    box.releases = 0;
    box.device.microphone.claim = () => new Promise((resolve) => claims.push(resolve));
    box.device.microphone.release = () => (box.releases += 1);
    const { terminals } = fakeTerminals(() => [{ event: "/verbatim/partial", transcript: "second session" }]);
    const dictaphone = dictation({ terminals, box });

    const first = dictaphone.start();
    dictaphone.cancel();
    const second = dictaphone.start();
    claims[1]();
    await second;
    specimen.expect(dictaphone.$active.get()).toBe("listening");

    const releases = box.releases;
    claims[0]();
    await first;
    specimen.expect(dictaphone.$active.get()).toBe("listening");
    specimen.expect(box.releases).toBe(releases);

    dictaphone.cancel();
    await dictaphone.settled();
  });

  specimen.it("refuses to start without a verbatim harness on the active thread", async () => {
    const box = fakeBox([]);
    const dictaphone = dictation({ terminals: { active: { thread: { id: "t2", mode: { harness: {} } } } }, box });
    await dictaphone.start();
    specimen.expect(dictaphone.$active.get()).toBe("idle");
    specimen.expect(dictaphone.$error.get()).toContain("verbatim");
    specimen.expect(box.released).toBe(false);
  });
});
