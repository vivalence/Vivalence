const media = (kind) => (message, fetched) =>
  fetched(message[kind].id).then(
    (held) => [
      { type: kind, ...held },
      ...(message[kind].caption ? [{ type: "text", text: message[kind].caption }] : []),
    ],
    (fault) => [
      { type: "alien", dialect: "whatsapp", block: { ...message, fault: fault.message } },
    ],
  );

const carried = {
  text: (message) => [{ type: "text", text: message.text.body }],
  reaction: (message) => [{ type: "text", text: message.reaction.emoji }],
  image: media("image"),
  audio: media("audio"),
  video: media("video"),
  document: media("document"),
};

const about = (message) =>
  message.type === "reaction"
    ? { about: { id: message.reaction.message_id, act: "reaction" } }
    : message.context?.id
      ? { about: { id: message.context.id, act: "reply" } }
      : {};

export const heard = (payload, owner, fetched) =>
  Promise.all(
    payload.entry.flatMap((entry) =>
      entry.changes.flatMap((change) =>
        (change.value.messages ?? [])
          .filter((message) => message.from === owner)
          .map(async (message) => ({
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
