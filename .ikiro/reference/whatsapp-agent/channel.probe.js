import { v } from "@vivalence/typology";

export const Channel = v.object({
  type: v.union([
    v.const("text"),
    v.const("image"),
    v.const("audio"),
    v.const("video"),
    v.const("document"),
    v.const("object"),
    v.const("tool_use"),
    v.const("tool_result"),
    v.const("thinking"),
  ]),
  mime: v.array(v.mime()).optional().desc("The formats taken or given, exact."),
  rate: v.integer().optional().desc("Samples a second, for audio/L16. Example: 16000"),
  codecs: v.array(v.string()).optional().desc("Narrows a mime to these codecs, RFC 6381."),
});

export const Channels = v.object({ in: v.array(Channel), out: v.array(Channel) });

const deepgram = {
  in: [
    { type: "audio", mime: ["audio/L16"], rate: 16000 },
    { type: "audio", mime: ["audio/ogg", "audio/mpeg", "audio/mp4", "audio/aac"] },
  ],
  out: [{ type: "text" }],
};
const anthropic = {
  in: [
    { type: "text" },
    { type: "image", mime: ["image/jpeg", "image/png", "image/gif", "image/webp"] },
    { type: "document", mime: ["application/pdf"] },
    { type: "tool_use" },
    { type: "tool_result" },
  ],
  out: [{ type: "text" }, { type: "tool_use" }],
};
const today = { in: ["text", "image"], out: [{ type: "event" }] };

for (const [name, held] of Object.entries({ deepgram, anthropic, today }))
  console.log(name, v.faults(Channels, held).map(({ at, reason }) => `${at} ${reason}`));
