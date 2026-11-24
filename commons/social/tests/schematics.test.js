import { specimen, v } from "@vivalence/typology";
import { Message } from "../schematics.js";

const { describe, it, expect } = specimen;

const heard = {
  platform: "whatsapp",
  id: "wamid.A",
  from: "4915100000000",
  name: "Finn",
  at: 1732440000,
};

const location = {
  from: "4915100000000",
  timestamp: "1732440000",
  id: "wamid.F",
  type: "location",
  location: { latitude: 52.52, longitude: 13.405, name: "Berlin" },
};

const unsupported = {
  from: "4915100000000",
  timestamp: "1732440000",
  id: "wamid.G",
  type: "unsupported",
  errors: [{ code: 131051, title: "Message type unknown" }],
};

describe("Message — what every platform hands the bot", () => {
  it("a text is one text part", () => {
    expect(v.faults(Message, { ...heard, parts: [{ type: "text", text: "hi" }] })).toEqual([]);
  });

  it("a voice note is one audio part holding its bytes", () => {
    const parts = [{ type: "audio", data: "Ynl0ZXMgb2YgNzc4", mime: "audio/ogg" }];
    expect(v.faults(Message, { ...heard, parts })).toEqual([]);
  });

  it("a picture with a caption is two parts, in order", () => {
    const parts = [
      { type: "image", data: "Ynl0ZXMgb2YgOTAx", mime: "image/jpeg" },
      { type: "text", text: "the receipt" },
    ];
    expect(v.faults(Message, { ...heard, parts })).toEqual([]);
  });

  it("a reply names the earlier message", () => {
    const about = { id: "wamid.A", act: "reply" };
    const parts = [{ type: "text", text: "this one" }];
    expect(v.faults(Message, { ...heard, id: "wamid.D", parts, about })).toEqual([]);
  });

  it("a reaction is its emoji about the earlier message", () => {
    const about = { id: "wamid.A", act: "reaction" };
    const parts = [{ type: "text", text: "👍" }];
    expect(v.faults(Message, { ...heard, id: "wamid.E", parts, about })).toEqual([]);
  });

  it("a kind we do not have is an alien part holding the platform's block", () => {
    const parts = [{ type: "alien", dialect: "whatsapp", block: location }];
    expect(v.faults(Message, { ...heard, id: "wamid.F", parts })).toEqual([]);
  });

  it("the platform's own unsupported is an alien part too", () => {
    const parts = [{ type: "alien", dialect: "whatsapp", block: unsupported }];
    expect(v.faults(Message, { ...heard, id: "wamid.G", parts })).toEqual([]);
  });

  it("a message of one key is refused, every missing key named", () => {
    expect(v.faults(Message, { platform: "whatsapp" })[0].reason).toBe(
      "must have required properties id, from, name, at, parts",
    );
  });

  it("a part of a foreign kind is refused", () => {
    expect(v.faults(Message, { ...heard, parts: [{ type: "sticker" }] }).length > 0).toBe(true);
  });

  it("an act outside reply, reaction, edit and delete is refused", () => {
    const about = { id: "wamid.A", act: "forward" };
    const faults = v.faults(Message, { ...heard, parts: [{ type: "text", text: "hi" }], about });
    expect(faults.every((fault) => fault.at === "/about/act")).toBe(true);
    expect(faults.length > 0).toBe(true);
  });
});
