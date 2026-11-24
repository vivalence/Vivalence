import { encodeBase64 } from "@std/encoding";
import { Queue } from "@vivalence/typology";
import { answered, meta } from "./graph.js";
import { heard } from "./heard.js";

export const numbers = new Map();

const CAP = 4096;

const format = [
  "Your reply is read in WhatsApp. Write its markup, never Markdown:",
  "*bold* · _italic_ · ~strike~ · ```monospace``` · `inline code`",
  "· > quote · - list · 1. list.",
  "No headings, no tables, no links behind words: a URL is written out.",
].join(" ");

const pieces = (text) => {
  if (text.length <= CAP) return [text];
  const edges = [text.lastIndexOf("\n", CAP), text.lastIndexOf(" ", CAP)];
  const at = edges.find((edge) => edge > CAP / 2) ?? CAP;
  return [text.slice(0, at), ...pieces(text.slice(at).trimStart())];
};

export function provider(service) {
  const whatsapp = meta(service);
  const inbox = numbers.has(service.statics.number)
    ? numbers.get(service.statics.number).inbox
    : new Queue();
  numbers.set(service.statics.number, { inbox, service });

  const fetched = async (id) => {
    const held = await whatsapp.media(id);
    const bytes = await fetch(held.url, {
      headers: { authorization: `Bearer ${service.secrets.token}` },
    })
      .then(answered)
      .then((response) => response.bytes());
    return { data: encodeBase64(bytes), mime: held.mime_type };
  };

  return {
    async *messages(signal, addresses) {
      for await (const payload of inbox.drain(signal))
        yield* await heard(payload, addresses, fetched);
    },
    format,
    typing: whatsapp.typing,
    quote: (text) =>
      text
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n"),
    send: async (address, text) => {
      const sent = [];
      for (const body of pieces(text)) sent.push(await whatsapp.text(address, body));
      return sent;
    },
  };
}
