import { v } from "@vivalence/typology";

const { Part } = v.primitives.hallucination;

export const About = v.object({
  id: v.string().desc("the earlier message's id on that platform").example("wamid.HBgM"),
  act: v
    .enum(["reply", "reaction", "edit", "delete"])
    .desc("what this message does to the earlier one")
    .example("reply"),
});

export const Message = v.object({
  platform: v.string().desc("the messenger it came in on").example("whatsapp"),
  id: v.string().desc("its id there, unique per platform").example("wamid.HBgN"),
  from: v.string().desc("the address a reply goes to").example("4915100000000"),
  name: v.string().desc("the sender's display name").example("Finn"),
  at: v.integer().desc("unix seconds, the platform's clock").example(1732440000),
  parts: v
    .array(v.union([Part.Text, Part.Image, Part.Audio, Part.Video, Part.Document, Part.Alien]))
    .desc("what it carries, in order; a kind the platform has and we do not is an alien part"),
  about: About.optional().desc("set when it acts on an earlier message; absent on a fresh one"),
});

const carried = {
  text: (message) => [{ type: "text", text: message.text.body }],
  reaction: (message) => [{ type: "text", text: message.reaction.emoji }],
  image: async (message, fetched) => [
    { type: "image", ...(await fetched(message.image.id)) },
    ...(message.image.caption ? [{ type: "text", text: message.image.caption }] : []),
  ],
  audio: async (message, fetched) => [{ type: "audio", ...(await fetched(message.audio.id)) }],
};

const about = (message) =>
  message.type === "reaction"
    ? { about: { id: message.reaction.message_id, act: "reaction" } }
    : message.context?.id
      ? { about: { id: message.context.id, act: "reply" } }
      : {};

export const whatsapp = (payload, fetched) =>
  Promise.all(
    payload.entry.flatMap((entry) =>
      entry.changes.flatMap((change) =>
        (change.value.messages ?? []).map(async (message) => ({
          platform: "whatsapp",
          id: message.id,
          from: message.from,
          name: change.value.contacts[0].profile.name,
          at: Number(message.timestamp),
          parts: carried[message.type]
            ? await carried[message.type](message, fetched)
            : [{ type: "alien", dialect: "whatsapp", block: message }],
          ...about(message),
        })),
      ),
    ),
  );

const fetched = async (id) => ({ data: btoa(`bytes of ${id}`), mime: id === "778" ? "audio/ogg" : "image/jpeg" });
const wrap = (...messages) => ({
  object: "whatsapp_business_account",
  entry: [{ id: "1", changes: [{ field: "messages", value: {
    messaging_product: "whatsapp",
    contacts: [{ profile: { name: "Finn" }, wa_id: "4915100000000" }],
    messages,
  } }] }],
});
const base = { from: "4915100000000", timestamp: "1732440000" };

const heard = await whatsapp(wrap(
  { ...base, id: "wamid.A", type: "text", text: { body: "hi" } },
  { ...base, id: "wamid.B", type: "audio", audio: { id: "778", mime_type: "audio/ogg; codecs=opus", voice: true } },
  { ...base, id: "wamid.C", type: "image", image: { id: "901", mime_type: "image/jpeg", caption: "the receipt" } },
  { ...base, id: "wamid.D", type: "text", text: { body: "this one" }, context: { from: "15550001111", id: "wamid.A" } },
  { ...base, id: "wamid.E", type: "reaction", reaction: { message_id: "wamid.A", emoji: "👍" } },
  { ...base, id: "wamid.F", type: "location", location: { latitude: 52.52, longitude: 13.405, name: "Berlin" } },
  { ...base, id: "wamid.G", type: "unsupported", errors: [{ code: 131051, title: "Message type unknown" }] },
), fetched);

for (const message of heard) console.log(JSON.stringify(message), JSON.stringify(v.faults(Message, message)));
console.log(JSON.stringify(v.faults(Message, { platform: "whatsapp" })));
console.log(JSON.stringify(v.faults(Message, { ...heard[0], parts: [{ type: "sticker" }] })));
console.log(JSON.stringify(v.faults(Message, { ...heard[0], about: { id: "wamid.A", act: "forward" } })));
