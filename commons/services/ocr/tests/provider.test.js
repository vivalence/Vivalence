import { encodeBase64 } from "@std/encoding/base64";
import { specimen } from "@vivalence/typology";
import provider, { joined, translate } from "../provider/index.js";
import { Block } from "../schematics.js";

const { describe, it, expect } = specimen;

const fixture = (name) => new URL(`./fixtures/${name}`, import.meta.url);

const part = async (name, type, media) => ({
  type,
  media,
  data: encodeBase64(await Deno.readFile(fixture(name))),
});

const gathered = async (events) => {
  const held = [];
  for await (const event of events) held.push(event);
  return held;
};

const unreached = { statics: { remote: "http://localhost:1" }, secrets: { key: "unreached" } };

describe("ocr provider — refusals, no engine reached", () => {
  it("a source that is no part is refused", async () => {
    const transcribe = provider(unreached);
    await expect(gathered(transcribe({ type: "text", text: "Tides" }))).rejects.toThrow("ocr: invalid source");
  });

  it("a part that is neither a pdf nor an image is refused by its media", async () => {
    const source = { type: "document", media: "text/plain", data: encodeBase64("Tides") };
    await expect(gathered(provider(unreached)(source))).rejects.toThrow("ocr: text/plain is neither a pdf nor an image");
  });

  it("an image that is a list of paths never reaches the engine, which would open each path", async () => {
    const source = { type: "image", media: "image/png", data: encodeBase64(`${fixture("one-word.png").pathname}\n`) };
    await expect(gathered(provider(unreached)(source))).rejects.toThrow("ocr: this image/png holds no image the engine reads");
  });

  it("a pdf that holds no pdf is refused before anything is drawn", async () => {
    const source = { type: "document", media: "application/pdf", data: encodeBase64("<!doctype html><h1>Tides</h1>") };
    await expect(gathered(provider(unreached)(source))).rejects.toThrow("ocr: this application/pdf holds no pdf");
  });

  it("a setting outside the schematic is refused, not handed to an engine", async () => {
    const source = await part("one-word.png", "image", "image/png");
    await expect(gathered(provider(unreached)(source, { density: 10 }))).rejects.toThrow("ocr: invalid settings /density");
  });
});

describe("ocr provider — a paragraph the engine split is one block", () => {
  const split = async () => translate(await Deno.readTextFile(fixture("split-paragraph.tsv")), 1);

  it("the second half resumes mid-sentence, so both come as one, the broken word mended", async () => {
    const halves = await split();
    const whole = await gathered(joined(halves));
    expect(halves.length).toBe(2);
    expect(whole.length).toBe(1);
    expect(whole[0].text).toContain("the chemical composition and structure of semiconductors");
    expect(whole[0].words.length).toBe(halves[0].words.length + halves[1].words.length);
  });

  it("a half on the next page stays its own block", async () => {
    const [held, resumed] = await split();
    const turned = { ...resumed, words: resumed.words.map((word) => ({ ...word, page: 2 })) };
    expect((await gathered(joined([held, turned]))).length).toBe(2);
  });

  it("a block that ends its sentence is never joined", async () => {
    const [held, resumed] = await split();
    const ended = { ...held, text: `${held.text}.` };
    expect((await gathered(joined([ended, resumed]))).length).toBe(2);
  });
});

describe("ocr provider — statics.remote given, the engine is its server", () => {
  const served = async (answer) => {
    const asked = [];
    const server = Deno.serve({ port: 0, onListen: () => undefined }, async (request) => {
      asked.push({ key: request.headers.get("authorization"), path: new URL(request.url).pathname, body: await request.json() });
      return answer();
    });
    const service = { statics: { remote: `http://localhost:${server.addr.port}` }, secrets: { key: "tide" } };
    return { asked, server, transcribe: provider(service) };
  };

  it("a page goes over keyed, with its language and segmentation, and the server's tsv comes back as blocks", async () => {
    const tsv = await Deno.readTextFile(fixture("one-word.tsv"));
    const { asked, server, transcribe } = await served(() => Response.json({ tsv }));
    const source = await part("one-word.png", "image", "image/png");
    const held = await gathered(transcribe(source, { language: "ita" }));
    await server.shutdown();
    expect(held.map((block) => block.text)).toEqual(["Tides"]);
    expect(asked).toEqual([
      { key: "Bearer tide", path: "/read", body: { segmentation: 1, language: "ita", data: source.data } },
    ]);
  });

  it("a pdf page goes over drawn, its density stated", async () => {
    const tsv = await Deno.readTextFile(fixture("one-word.tsv"));
    const { asked, server, transcribe } = await served(() => Response.json({ tsv }));
    const held = await gathered(transcribe(await part("two-pages.pdf", "document", "application/pdf"), { density: 150 }));
    await server.shutdown();
    expect(held.map((block) => block.words[0].page)).toEqual([1, 2]);
    expect(asked.map((request) => request.body.density)).toEqual([150, 150]);
    expect(asked.every((request) => request.body.data.startsWith(encodeBase64("P5\n")))).toBe(true);
  });

  it("the server's refusal is the sentence", async () => {
    const refusal = () => Response.json({ message: "the engine holds no zzz" }, { status: 422 });
    const { server, transcribe } = await served(refusal);
    const reading = gathered(transcribe(await part("one-word.png", "image", "image/png"), { language: "zzz" }));
    await expect(reading).rejects.toThrow("ocr: the engine holds no zzz");
    await server.shutdown();
  });

  it("a server that does not answer is a sentence, never a silent read by the other engine", async () => {
    const reading = gathered(provider(unreached)(await part("one-word.png", "image", "image/png")));
    await expect(reading).rejects.toThrow("ocr: http://localhost:1 does not answer");
  });
});

describe("ocr provider — no remote, the engine is tesseract as wasm", () => {
  const transcribe = provider({});

  it("an image reads as one page", async () => {
    const held = await gathered(transcribe(await part("one-word.png", "image", "image/png")));
    expect(held.map((block) => block.text)).toEqual(["Tides"]);
    expect(held[0].words[0].page).toBe(1);
    expect(Block.faults(held[0])).toEqual([]);
  });

  it("a bmp reads as its png does", async () => {
    const held = await gathered(transcribe(await part("one-word.bmp", "image", "image/bmp")));
    expect(held.map((block) => block.text)).toEqual(["Tides"]);
  });

  it("a pdf reads page after page, in order", async () => {
    const held = await gathered(transcribe(await part("two-pages.pdf", "document", "application/pdf")));
    expect(held.map((block) => block.words[0].page)).toEqual(held.map((block) => block.words[0].page).toSorted());
    expect(held.at(-1).text).toBe("Tides");
    expect(held.at(-1).words[0].page).toBe(2);
    expect(held[0].words[0].page).toBe(1);
    expect(held.map((block) => block.text).join(" ").startsWith("Tide Tables")).toBe(true);
  });

  it("a language the engine does not hold is a sentence, never a silent read in another", async () => {
    const reading = gathered(transcribe(await part("one-word.png", "image", "image/png"), { language: "eng+zzz" }));
    await expect(reading).rejects.toThrow("ocr: the engine holds no zzz");
  });

  it("a word's box stays inside its page", async () => {
    const held = await gathered(transcribe(await part("two-pages.pdf", "document", "application/pdf")));
    for (const word of held.flatMap((block) => block.words)) {
      expect(word.box.every((fraction) => fraction >= 0 && fraction <= 1)).toBe(true);
    }
  });
});
