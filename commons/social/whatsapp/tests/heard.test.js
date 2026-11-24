import { specimen, v } from "@vivalence/typology";
import { Message } from "../../schematics.js";
import { heard } from "../heard.js";

const { describe, it, expect } = specimen;

const OWNER = "4915100000000";

const MIMES = {
  778: "audio/ogg; codecs=opus",
  901: "image/jpeg",
  902: "video/mp4",
  903: "application/pdf",
};

const asked = [];

const fetched = async (id) => {
  asked.push(id);
  if (!MIMES[id]) throw new Error("whatsapp: 404 no such thing");
  return { data: btoa(`bytes of ${id}`), mime: MIMES[id] };
};

const delivered = (...messages) => ({
  object: "whatsapp_business_account",
  entry: [
    {
      id: "1",
      changes: [
        {
          field: "messages",
          value: {
            messaging_product: "whatsapp",
            contacts: [{ profile: { name: "Finn" }, wa_id: OWNER }],
            messages,
          },
        },
      ],
    },
  ],
});

const receipt = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "1",
      changes: [
        {
          field: "messages",
          value: {
            messaging_product: "whatsapp",
            statuses: [{ id: "wamid.OUT", status: "delivered" }],
          },
        },
      ],
    },
  ],
};

const sent = { from: OWNER, timestamp: "1732440000" };

const one = async (message) => {
  const [held, ...rest] = await heard(delivered({ ...sent, ...message }), [OWNER], fetched);
  expect(rest).toEqual([]);
  expect(v.faults(Message, held)).toEqual([]);
  return held;
};

describe("whatsapp heard — one delivery into Messages", () => {
  it("a text is one text part, under the sender's address, name and time", async () => {
    expect(await one({ id: "wamid.A", type: "text", text: { body: "hi" } })).toEqual({
      platform: "whatsapp",
      id: "wamid.A",
      from: OWNER,
      name: "Finn",
      at: 1732440000,
      parts: [{ type: "text", text: "hi" }],
    });
  });

  it("a voice note is one audio part holding the fetched bytes and their mime", async () => {
    const audio = { id: "778", mime_type: "audio/ogg; codecs=opus", voice: true };
    const held = await one({ id: "wamid.B", type: "audio", audio });
    expect(held.parts).toEqual([{ type: "audio", data: btoa("bytes of 778"), mime: MIMES[778] }]);
  });

  it("a picture, a video and a document are a media part, then their caption", async () => {
    const image = { id: "901", mime_type: "image/jpeg", caption: "the receipt" };
    const video = { id: "902", mime_type: "video/mp4" };
    const document = { id: "903", mime_type: "application/pdf", filename: "r.pdf", caption: "q3" };
    expect((await one({ id: "wamid.C", type: "image", image })).parts).toEqual([
      { type: "image", data: btoa("bytes of 901"), mime: MIMES[901] },
      { type: "text", text: "the receipt" },
    ]);
    expect((await one({ id: "wamid.H", type: "video", video })).parts).toEqual([
      { type: "video", data: btoa("bytes of 902"), mime: MIMES[902] },
    ]);
    expect((await one({ id: "wamid.I", type: "document", document })).parts).toEqual([
      { type: "document", data: btoa("bytes of 903"), mime: MIMES[903] },
      { type: "text", text: "q3" },
    ]);
  });

  it("a swipe-reply and a reaction name the earlier message", async () => {
    const context = { from: "15550001111", id: "wamid.A" };
    const reply = await one({ id: "wamid.D", type: "text", text: { body: "this one" }, context });
    expect(reply.about).toEqual({ id: "wamid.A", act: "reply" });

    const reaction = { message_id: "wamid.A", emoji: "👍" };
    const reacted = await one({ id: "wamid.E", type: "reaction", reaction });
    expect(reacted.parts).toEqual([{ type: "text", text: "👍" }]);
    expect(reacted.about).toEqual({ id: "wamid.A", act: "reaction" });
  });

  it("a kind we do not have is one alien part holding Meta's block whole", async () => {
    const location = { latitude: 52.52, longitude: 13.405, name: "Berlin" };
    const message = { ...sent, id: "wamid.F", type: "location", location };
    const held = await one(message);
    expect(held.parts).toEqual([{ type: "alien", dialect: "whatsapp", block: message }]);
  });

  it("a media fetch that fails keeps the message, as an alien part naming the fault", async () => {
    const message = { ...sent, id: "wamid.L", type: "audio", audio: { id: "999" } };
    const held = await one(message);
    expect(held.parts).toEqual([
      {
        type: "alien",
        dialect: "whatsapp",
        block: { ...message, fault: "whatsapp: 404 no such thing" },
      },
    ]);
  });

  it("a stranger's message is skipped before its media is fetched", async () => {
    asked.length = 0;
    const stranger = { ...sent, from: "15550009999", id: "wamid.S", type: "audio" };
    const mine = { ...sent, id: "wamid.A", type: "text", text: { body: "hi" } };
    const payload = delivered({ ...stranger, audio: { id: "778" } }, mine);
    const held = await heard(payload, [OWNER], fetched);
    expect(held.map((message) => message.id)).toEqual(["wamid.A"]);
    expect(asked).toEqual([]);
  });

  it("a delivery receipt holds no message", async () => {
    expect(await heard(receipt, [OWNER], fetched)).toEqual([]);
  });
});
