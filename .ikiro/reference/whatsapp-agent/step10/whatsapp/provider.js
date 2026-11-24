import { encodeBase64 } from "@std/encoding";
import { Queue } from "@vivalence/typology";
import { heard } from "./heard.js";

export const inbox = new Queue();

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

const answered = async (response) => {
  if (!response.ok) throw new Error(`whatsapp: ${response.status} ${await response.text()}`);
  return response;
};

export function provider(service) {
  const headers = { authorization: `Bearer ${service.secrets.token}` };

  const fetched = async (id) => {
    const held = await fetch(`${service.statics.graph}/${id}`, { headers })
      .then(answered)
      .then((response) => response.json());
    const bytes = await fetch(held.url, { headers })
      .then(answered)
      .then((response) => response.bytes());
    return { data: encodeBase64(bytes), mime: held.mime_type };
  };

  return {
    async *messages(signal) {
      for await (const payload of inbox.drain(signal))
        yield* await heard(payload, service.statics.owner, fetched);
    },
    format,
    send: async (address, text) => {
      const sent = [];
      for (const body of pieces(text))
        sent.push(
          await fetch(`${service.statics.graph}/${service.statics.number}/messages`, {
            method: "POST",
            headers: { ...headers, "content-type": "application/json" },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: address,
              type: "text",
              text: { body },
            }),
          })
            .then(answered)
            .then((response) => response.json()),
        );
      return sent;
    },
  };
}
