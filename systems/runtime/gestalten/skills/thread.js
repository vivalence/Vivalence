import { v, Vector } from "@vivalence/typology";
import { places } from "./mode.js";

const named = (row) => row.trait?.LABELED?.name ?? "unlabeled";

const shown = (data, width = 320) => {
  const text = JSON.stringify(data ?? {});
  return text.length <= width ? text : `${text.slice(0, width)}… keys ${Object.keys(data).join(" ")}`;
};

const address = (mode) => `${mode.manifest.type}/${mode.manifest.slug}`;

const threadline = (thread) =>
  `[Thread ${thread.id}] · ${named(thread)} · phase ${thread.phase} · buffers minted ${thread.counter} · ` +
  `traits ${thread.traits.join(" ") || "none"} · user ${thread.user.id}`;

const modeline = (mode) =>
  [
    `[Mode ${address(mode)}] ${mode.manifest.name ?? mode.manifest.slug}`,
    `traits ${(mode.manifest.traits ?? []).join(" ") || "none"}`,
    places(mode),
  ].filter(Boolean).join(" · ");

const bufferline = (buffer, modes) =>
  `${buffer.index} · ${buffer.id} · ${named(buffer)} · ${modes.get(buffer.mode.id)} · ${buffer.status} · ${shown(buffer.data)}` +
  (buffer.view?.hash ? ` · view ${buffer.view.hash}` : "");

export const summary = async ({ daemon, mode, thread }) => {
  const modes = new Map(daemon.flatmodes().map((peer) => [peer.id, address(peer)]));
  const buffers = await daemon.entities.buffer.find({ thread: thread.id }, { orderBy: { index: "asc" } });
  return [
    threadline(thread),
    modeline(mode),
    `[Buffers on this thread] · ${buffers.length} · rows: index · id · label · mode · status · data · view — ` +
      `these ids are what buffer_update and buffer_label take, never a document slug; ` +
      `entity_find { entity: "buffer", where: { thread: "${thread.id}" }, fields: "full" } for whole rows`,
    ...buffers.map((buffer) => bufferline(buffer, modes)),
  ].join("\n");
};

export const thread = new Vector().open(
  {
    nature: "/thread/update",
    valence: "Write a thread's trait data — its configuration surface. Pass the thread id and a " +
      "trait patch keyed by trait name (e.g. MASKED query data); each named trait's data " +
      "merges over the existing value. This thread's id is in the thread section of your " +
      "context. Returns { message, thread: [{ id, phase, traits, trait, counter, cursor }] }. " +
      'Example: { id: "01a09010-13aa-778b-bce7-19c38f835337", trait: { LABELED: { name: "Q3 filings" } } }',
    input: v.object({
      id: v.string().desc(
        'The thread id. Example: "01a09010-13aa-778b-bce7-19c38f835337"',
      ),
      trait: v
        .record(v.string(), v.unknown())
        .desc(
          "Trait data to merge, keyed by trait name. " +
            'Example: { LABELED: { name: "Q3 filings", description: "the filings correspondence" } }',
        ),
    }),
  },
  async (ctx) => {
    const row = await ctx.daemon.entities.thread.findOneOrFail({
      id: ctx.input.id,
    });
    row.trait = { ...row.trait, ...ctx.input.trait };
    await ctx.daemon.entities.em.flush();
    return { message: `thread ${row.id} updated`, thread: [row] };
  },
);
