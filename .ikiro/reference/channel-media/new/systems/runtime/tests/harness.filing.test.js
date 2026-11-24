import { join } from "@std/path";
import { encodeBase64 } from "@std/encoding/base64";
import { sleep, specimen } from "@vivalence/typology";
import { create } from "./scenarios/cortex.js";
import { speechFaculty, textStream, textTurn } from "./scenarios/fixtures.js";

const BYTES = new TextEncoder().encode("OggS-a-voice-note");
const TAKEN = [{ type: "text" }, { type: "audio", mime: ["audio/ogg"] }];
const seen = [];

const witness = {
  type: "dialogue",
  id: "witness",
  tune: [0.5, 0.5, 0.5],
  context: 1000,
  channels: {
    stream: {
      in: TAKEN,
      out: [{ type: "text" }],
      via: async (request) => {
        seen.push(request);
        return textStream("heard")();
      },
    },
    render: {
      in: TAKEN,
      out: [{ type: "text" }],
      via: async (request) => {
        seen.push(request);
        return textTurn("heard");
      },
    },
  },
};

const ear = {
  type: "verbatim",
  id: "filing-ear",
  tune: [0.4, 0.5, 0.1],
  context: 0,
  channels: {
    stream: {
      in: [{ type: "audio", mime: ["audio/pcm;rate=16000;channels=1"] }],
      out: [{ type: "text" }],
      via: async function* ({ source }) {
        for await (const packet of source) {
          yield { event: "/turn/open", turn: { role: "user" } };
          yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
          yield { event: "/part/delta", index: 0, part: { text: packet.audio.data } };
          yield { event: "/part/close", index: 0 };
          yield { event: "/turn/close", turn: {} };
        }
      },
    },
  },
};

async function* microphone(words) {
  for (const word of words) yield { event: "/audio/packet", audio: { data: word, rate: 16000 } };
  await sleep.ms(400);
}

let scenario;
let directory;

const noted = async (thread) => {
  const mount = join(directory, `${thread.id}.ogg`);
  await Deno.writeFile(mount, BYTES);
  return scenario.entities.file.upload({
    mode: scenario.fixtures.dewey,
    path: `${thread.id}.ogg`,
    mount,
    mime: "audio/ogg; codecs=opus",
    hash: thread.id,
    bytes: BYTES.length,
    thread: thread.id,
  });
};

const handed = (file) => ({
  type: "audio",
  mime: "audio/ogg; codecs=opus",
  data: encodeBase64(BYTES),
  file: file.id,
});

const drained = async (packets) => {
  for await (const _packet of packets);
};

specimen.describe("harness filing — a file part reaches a faculty as its bytes", () => {
  specimen.beforeAll(async () => {
    directory = await Deno.makeTempDir({ prefix: "viva-filing-" });
    scenario = await create({ faculties: [witness, ear, speechFaculty()] });
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
    await Deno.remove(directory, { recursive: true });
  });

  specimen.beforeEach(() => {
    seen.length = 0;
  });

  specimen.it("/dialogue: the file part is handed; the stored turn keeps the file", async () => {
    const thread = await scenario.createThread();
    const file = await noted(thread);
    await scenario.dewey.harness.dialogue.render({
      thread: thread.id,
      id: "witness",
      parts: [{ type: "file", file: file.id }],
    });
    specimen.expect(seen[0].turns.at(-1).parts).toEqual([handed(file)]);
    scenario.em.clear();
    const stored = await scenario.entities.turn.history({ thread: thread.id });
    specimen.expect(stored[0].parts).toEqual([{ type: "file", file: file.id }]);
  });

  specimen.it("/object: a caller's file part is handed; its turns are not mutated", async () => {
    const thread = await scenario.createThread();
    const file = await noted(thread);
    const turns = [{ role: "user", parts: [{ type: "file", file: file.id }] }];
    await scenario.dewey.harness.object.render({ thread: thread.id, id: "witness", turns });
    specimen.expect(seen[0].turns.at(-1).parts).toEqual([handed(file)]);
    specimen.expect(turns).toEqual([{ role: "user", parts: [{ type: "file", file: file.id }] }]);
  });

  specimen.it("/call: a file part in the thread's history is handed to the mind", async () => {
    const thread = await scenario.createThread();
    const file = await noted(thread);
    await scenario.entities.turn.chain({
      role: "user",
      parts: [{ type: "file", file: file.id }],
      parent: null,
      thread: thread.id,
      mode: scenario.dewey.id,
    });
    await drained(
      await scenario.dewey.harness.call.stream({
        source: microphone(["ciao"]),
        thread: thread.id,
        id: "witness",
      }),
    );
    specimen.expect(seen[0].turns[0].parts).toEqual([handed(file)]);
  });

  specimen.it("a file of another thread is not handed", async () => {
    const thread = await scenario.createThread();
    const file = await noted(await scenario.createThread());
    const turns = [{ role: "user", parts: [{ type: "file", file: file.id }] }];
    let fault = null;
    try {
      await scenario.dewey.harness.object.render({ thread: thread.id, id: "witness", turns });
    } catch (thrown) {
      fault = thrown;
    }
    specimen.expect(fault).not.toBe(null);
    specimen.expect(seen).toHaveLength(0);
  });
});
