import { specimen } from "@vivalence/typology";
import { atom, deepMap } from "nanostores";
import {
  wire,
  engage,
  release,
} from "../../src/typology/traits/thread/conversational.js";

function makeFakeThread({ traits = ["LABELED"], mode = null, daemon = null } = {}) {
  const $traits = atom([...traits]);
  const $conversation = atom(null);
  const thread = {
    id: "thread-1",
    streams: null,
    socket: null,
    mode,
    daemon,
    get traits() {
      return $traits.get();
    },
    set traits(value) {
      $traits.set(value);
    },
    get conversation() {
      return $conversation.get();
    },
    set conversation(value) {
      $conversation.set(value);
    },
    $traits,
    $conversation,
  };
  return thread;
}

specimen.describe("traits/thread/conversational — engage/release/wire", () => {
  specimen.it("engage appends CONVERSATIONAL to traits and persists", async () => {
    const calls = [];
    const thread = makeFakeThread({
      daemon: {
        entities: {
          thread: {
            updateOne: (filter, patch) => {
              calls.push({ filter, patch });
              return Promise.resolve();
            },
          },
        },
      },
    });
    await engage(thread);
    specimen.expect(thread.traits).toEqual(["LABELED", "CONVERSATIONAL"]);
    specimen.expect(calls.length).toBe(1);
    specimen.expect(calls[0].filter).toEqual({ id: "thread-1" });
    specimen.expect(calls[0].patch).toEqual({ traits: ["LABELED", "CONVERSATIONAL"] });
  });

  specimen.it("engage is idempotent when CONVERSATIONAL already present", async () => {
    const calls = [];
    const thread = makeFakeThread({
      traits: ["LABELED", "CONVERSATIONAL"],
      daemon: {
        entities: { thread: { updateOne: (...args) => (calls.push(args), Promise.resolve()) } },
      },
    });
    await engage(thread);
    specimen.expect(calls.length).toBe(0);
    specimen.expect(thread.traits).toEqual(["LABELED", "CONVERSATIONAL"]);
  });

  specimen.it("release strips CONVERSATIONAL from traits and persists", async () => {
    const calls = [];
    const thread = makeFakeThread({
      traits: ["LABELED", "CONVERSATIONAL"],
      daemon: {
        entities: {
          thread: {
            updateOne: (filter, patch) => {
              calls.push({ filter, patch });
              return Promise.resolve();
            },
          },
        },
      },
    });
    await release(thread);
    specimen.expect(thread.traits).toEqual(["LABELED"]);
    specimen.expect(calls.length).toBe(1);
    specimen.expect(calls[0].patch).toEqual({ traits: ["LABELED"] });
  });

  specimen.it("release is idempotent when CONVERSATIONAL absent", async () => {
    const calls = [];
    const thread = makeFakeThread({
      daemon: {
        entities: { thread: { updateOne: (...args) => (calls.push(args), Promise.resolve()) } },
      },
    });
    await release(thread);
    specimen.expect(calls.length).toBe(0);
  });

  specimen.it("wire bails on open when mode connection is missing", () => {
    const thread = makeFakeThread({ traits: ["LABELED", "CONVERSATIONAL"], mode: {}, daemon: {} });
    const teardown = wire(thread);
    specimen.expect(thread.conversation).toBe(null);
    teardown();
  });

  specimen.it("wire returns a teardown that detaches the trait subscriber", () => {
    const thread = makeFakeThread();
    const teardown = wire(thread);
    specimen.expect(typeof teardown).toBe("function");
    teardown();
    thread.traits = ["LABELED", "CONVERSATIONAL"];
  });
});
