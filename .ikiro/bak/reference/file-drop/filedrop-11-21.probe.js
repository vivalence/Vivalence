// limit: 6400 chars · the file-drop cast end to end on the real `userspace` beat + `HARNESS`; home when run: `systems/runtime/tests/` of a tree COPY (its imports are relative to there); its print: `filedrop-11-21.txt`
import { join } from "@std/path";
import { encodeBase64 } from "@std/encoding/base64";
import { serialize } from "@mikro-orm/core";
import paladin from "@vivalence/paladin";
import { shard } from "@vivalence/typology";
import { FileEntity, TurnEntity } from "@vivalence/runtime";
import { create } from "./scenarios/activity.js";

const CAT = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3, 4, 5, 6, 7, 8]);
const DOG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 9, 9, 9, 9]);
const PICTURE = {
  packets: [
    {
      event: "/turn/full",
      turn: {
        role: "assistant",
        parts: [
          { type: "text", text: "here" },
          { type: "image", mime: "image/png", data: encodeBase64(DOG) },
        ],
        meta: { state: "complete" },
      },
    },
  ],
};

const say = (title, value) => console.log(`\n## ${title}\n${typeof value === "string" ? value : JSON.stringify(value, null, 2)}`);
const tried = async (act) => {
  try {
    return await act();
  } catch (error) {
    return `THROWN ${error.constructor.name}: ${error.message}`;
  }
};
const tree = async (root, at = "") => {
  const rows = [];
  for await (const entry of Deno.readDir(join(root, at))) {
    if (entry.isDirectory) rows.push(...(await tree(root, join(at, entry.name))));
    else rows.push(join(at, entry.name));
  }
  return rows.sort();
};

const world = await create({ script: () => PICTURE });
world.clock.release(1000);
const mountpoint = await Deno.makeTempDir({ prefix: "filedrop-" });
world.runtime.mountpoint = mountpoint;
world.dewey.aperture
  .branch("/harness")
  .use(shard.context.bind("runtime", { mountpoint, entities: world.runtime.entities }));

const beef = world.connect(world.fixtures.user).branch("/userspace/entities/file");
const stranger = world.connect(world.fixtures.stranger).branch("/userspace/entities/file");
const thread = await world.createThread();
const png = (bytes) => ({ headers: { "content-type": "image/png" }, raw: { body: new Blob([bytes]).stream() } });

const up = await tried(() => beef.call(`/upload/pictures/cat.png?thread=${thread.id}`, {}, png(CAT)));
say("1 beef uploads pictures/cat.png on his thread", up);

const pasted = await tried(() =>
  beef.call("/paste", { path: "pictures/cat.png", mime: "image/png", data: encodeBase64(CAT), thread: thread.id }),
);
say("2 a paste of the same bytes and path — same File id", { same: pasted.id === up.id, id: pasted.id });

say("3 stranger uploads on beef's thread", await tried(() => stranger.call(`/upload/x.png?thread=${thread.id}`, {}, png(CAT))));
say("4 a path leaving the root", await tried(() => beef.call(`/upload/..%2F..%2Fevil.png`, {}, png(CAT))));
say("5 stranger finds beef's File by id", await tried(() => stranger.call("/findOne", { where: { id: up.id } })));
say("6 disk under the runtime mountpoint", await tree(mountpoint));

const events = [];
const streamed = await tried(async () => {
  const packets = await world.dewey.harness.dialogue.stream({
    thread: thread.id,
    parts: [
      { type: "text", text: "look" },
      { type: "file", file: up.id },
    ],
  });
  for await (const packet of packets) events.push(packet);
  return "drained";
});
say("7 a streamed turn carrying the reference", streamed);
say("7a what the provider was handed (data cut to its length by this probe)",
  world.clock.seen.requests.at(-1)?.turns.map((turn) => ({
    role: turn.role,
    parts: turn.parts.map((part) => ("data" in part ? { ...part, data: `<${part.data.length} chars>` } : part)),
  })) ?? "no request",
);
say("7b the packets the caller drained", events.map((packet) => ("turn" in packet ? { event: packet.event, parts: packet.turn.parts } : { event: packet.event })));

const fork = world.em.fork();
const stored = await fork.find(TurnEntity, { thread: thread.id }, { orderBy: { createdAt: "ASC" } });
say("7c the stored turns", stored.map((turn) => ({ role: turn.role, parts: turn.parts })));
const held = await fork.find(FileEntity, { threads: thread.id }, { orderBy: { createdAt: "ASC" } });
say("7d the Files the thread holds", held.map((file) => serialize(file, { populate: ["threads:ref", "buffers:ref"] })));
say("7e disk after the turn", await tree(mountpoint));

const rendered = await tried(() =>
  world.dewey.harness.dialogue.render({ thread: thread.id, parts: [{ type: "text", text: "again" }] }),
);
say("8 a rendered turn — the answer's parts", typeof rendered === "string" ? rendered : rendered.turns?.map((turn) => turn.parts) ?? Object.keys(rendered));

const other = await world.createThread();
say("9 a reference another thread holds", await tried(async () => {
  const packets = await world.dewey.harness.dialogue.stream({ thread: other.id, parts: [{ type: "file", file: up.id }] });
  for await (const packet of packets) void packet;
  return "drained";
}));

const loose = await paladin.state.land(mountpoint, { path: "files/freight", mime: "image/png" }, new Blob([DOG, CAT]).stream());
const freight = await world.runtime.entities.file.upload(loose);
say("10 a File with no user (a mode's hand)", { id: freight.id, user: freight.user ?? null });
const taken = await tried(() => stranger.call("/upload/freight.png", {}, png(new Uint8Array([...DOG, ...CAT]))));
say("10a stranger uploads the same bytes and path", typeof taken === "string" ? taken : { same: taken.id === freight.id, user: taken.user });
say("10b beef asks for that File by id", await tried(async () => (await beef.call("/findOne", { where: { id: freight.id } }))?.id ?? null));

const broken = new ReadableStream({
  pull(controller) {
    controller.enqueue(CAT);
    controller.error(new Error("the wire died"));
  },
});
say("11 a body that faults mid-stream", await tried(() => paladin.state.land(mountpoint, { path: "torn/cat", mime: "image/png" }, broken)));
say("11a what it left under torn/", await tried(() => tree(mountpoint, "torn")));

await world.close();
Deno.exit(0);
