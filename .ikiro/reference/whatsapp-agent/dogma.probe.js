import { v } from "@vivalence/typology";

export const Message = v.object({
  platform: v.string().desc("the messenger it came in on").example("telegram"),
  id: v.string().desc("its id there, unique per platform").example("90001"),
  from: v.string().desc("the address a reply goes to").example("88120044"),
  name: v.string().desc("the sender's display name").example("Finn"),
  at: v.integer().desc("unix seconds, the platform's clock").example(1732440000),
  type: v.enum(["text", "audio"]).desc("what it carries").example("text"),
  text: v.string().optional().desc("its words, on a text").example("hi"),
  media: v.string().optional().desc("the platform's handle of its bytes, on an audio").example("AwACAgIAAxkBAAM"),
});

const telegram = (update) => ({
  platform: "telegram",
  id: String(update.update_id),
  from: String(update.message.chat.id),
  name: update.message.from.first_name,
  at: update.message.date,
  ...(update.message.voice
    ? { type: "audio", media: update.message.voice.file_id }
    : { type: "text", text: update.message.text }),
});

const whatsapp = (payload) =>
  payload.entry.flatMap((entry) =>
    entry.changes.flatMap((change) =>
      (change.value.messages ?? []).map((message) => ({
        platform: "whatsapp",
        id: message.id,
        from: message.from,
        name: change.value.contacts[0].profile.name,
        at: Number(message.timestamp),
        ...(message.type === "audio"
          ? { type: "audio", media: message.audio.id }
          : { type: "text", text: message.text.body }),
      })),
    ),
  );

const update = { update_id: 90001, message: { message_id: 12, from: { id: 88120044, is_bot: false, first_name: "Finn", username: "beef" }, chat: { id: 88120044, type: "private" }, date: 1732440000, text: "hi" } };
const payload = { object: "whatsapp_business_account", entry: [{ id: "1", changes: [{ field: "messages", value: { messaging_product: "whatsapp", metadata: { display_phone_number: "15550001111", phone_number_id: "2" }, contacts: [{ profile: { name: "Finn" }, wa_id: "4915100000000" }], messages: [{ from: "4915100000000", id: "wamid.HBgN", timestamp: "1732440000", type: "audio", audio: { id: "778", mime_type: "audio/ogg; codecs=opus" } }] } }] }] };
const statuses = { object: "whatsapp_business_account", entry: [{ id: "1", changes: [{ field: "messages", value: { messaging_product: "whatsapp", metadata: {}, statuses: [{ id: "wamid.X", status: "delivered" }] } }] }] };

console.log(JSON.stringify([Message.cast(telegram(update)), ...whatsapp(payload).map((message) => Message.cast(message)), whatsapp(statuses)]));
try { Message.cast({ platform: "telegram" }); console.log("NO THROW"); } catch (error) { console.log("throws:", error.message.slice(0, 90)); }
