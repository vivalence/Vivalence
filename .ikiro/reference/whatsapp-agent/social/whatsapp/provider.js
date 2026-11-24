import { encodeBase64 } from "@std/encoding";
import { Queue } from "@vivalence/typology";
import { heard } from "./heard.js";

export const inbox = new Queue();

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
    send: (address, text) =>
      fetch(`${service.statics.graph}/${service.statics.number}/messages`, {
        method: "POST",
        headers: { ...headers, "content-type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: address,
          type: "text",
          text: { body: text },
        }),
      })
        .then(answered)
        .then((response) => response.json()),
  };
}
