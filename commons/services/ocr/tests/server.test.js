import { encodeBase64 } from "@std/encoding/base64";
import { specimen } from "@vivalence/typology";
import provider from "../provider/index.js";

const { describe, it, expect } = specimen;

const PORT = 5556;
const listening = await Deno.connect({ port: PORT }).then(
  (socket) => {
    socket.close();
    return true;
  },
  () => false,
);

describe("ocr server — real ink through the container", { ignore: !listening || !Deno.env.has("SERVICE_KEY") }, () => {
  it("an image reads as one page", async () => {
    const service = { statics: { remote: `http://localhost:${PORT}` }, secrets: { key: Deno.env.get("SERVICE_KEY") } };
    const data = encodeBase64(await Deno.readFile(new URL("./fixtures/one-word.png", import.meta.url)));
    const held = [];
    for await (const block of provider(service)({ type: "image", mime: "image/png", data })) held.push(block);
    expect(held.map((block) => block.text)).toEqual(["Tides"]);
  });
});
