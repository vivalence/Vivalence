import { decodeBase64 } from "@std/encoding/base64";
import { v } from "@vivalence/typology";
import { Settings, Source } from "../schematics.js";
import { inline } from "./inline.js";
import { level, pack, skew, tilted } from "./level.js";
import { remote } from "./remote.js";

const RENDERER = "npm:@hyzyla/pdfium@3.0.0";

const decoder = new TextDecoder();

const fraction = (length, whole) => Math.round((Number(length) / whole) * 10000) / 10000;

const BROKEN = /\p{L}-$/u;
const RESUMES = /^\p{Ll}/u;

export const sewn = (text, word, wrapped) =>
  wrapped && BROKEN.test(text) && RESUMES.test(word) ? text.slice(0, -1) + word : `${text} ${word}`;

export function translate(tsv, page) {
  const records = tsv.split("\n").map((record) => record.split("\t"));
  const [, , , , , , , , width, height] = records.find(([level]) => level === "1");
  const words = records.filter(([level, , , , , , , , , , , text = ""]) => level === "5" && text.trim() !== "");
  const paragraphs = Map.groupBy(words, ([, , block, paragraph]) => `${block}/${paragraph}`);
  return [...paragraphs.values()].map((held) => ({
    text: held
      .slice(1)
      .reduce((text, word, index) => sewn(text, word[11], word[4] !== held[index][4]), held[0][11]),
    words: held.map(([, , , , , , left, top, wide, tall, confidence, text]) => ({
      word: text,
      confidence: Math.round(Number(confidence)) / 100,
      page,
      box: [fraction(left, width), fraction(top, height), fraction(wide, width), fraction(tall, height)],
    })),
  }));
}

const OPEN = /[\p{L}\p{N},-]$/u;

const several = ({ words }) => words.at(-1).box[1] > words[0].box[1] + words[0].box[3];

const resumes = (held, block) =>
  held.words.at(-1).page === block.words[0].page &&
  several(held) &&
  OPEN.test(held.text) &&
  RESUMES.test(block.text);

export async function* joined(blocks) {
  let held = null;
  for await (const block of blocks) {
    if (held && resumes(held, block)) {
      held = {
        text: sewn(held.text, block.text, true),
        words: [...held.words, ...block.words],
      };
      continue;
    }
    if (held) yield held;
    held = block;
  }
  if (held) yield held;
}

const upright = (box) => box;

const opens = (bytes, ...marks) => marks.some((mark) => mark.every((byte, index) => byte === null || bytes[index] === byte));

const INKS = [
  [(bytes) => opens(bytes, [0x89, 0x50, 0x4e, 0x47]), "png"],
  [(bytes) => opens(bytes, [0xff, 0xd8, 0xff]), "jpeg"],
  [(bytes) => opens(bytes, [0x49, 0x49, 0x2a, 0x00], [0x4d, 0x4d, 0x00, 0x2a]), "tiff"],
  [(bytes) => opens(bytes, [0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50]), "webp"],
  [(bytes) => opens(bytes, [0x47, 0x49, 0x46, 0x38]), "gif"],
  [(bytes) => opens(bytes, [0x42, 0x4d]), "bmp"],
];

async function* single(statics, bytes, settings, media) {
  if (!INKS.some(([matches]) => matches(bytes))) {
    throw new Error(`ocr: this ${media} holds no image the engine reads — ${INKS.map(([, name]) => name).join(" · ")}`);
  }
  yield [bytes, upright, {}];
}

async function* drawn(statics, bytes, settings, media) {
  if (!decoder.decode(bytes.subarray(0, 1024)).includes("%PDF-")) throw new Error(`ocr: this ${media} holds no pdf`);
  const { PDFiumLibrary } = await import(RENDERER);
  const library = await PDFiumLibrary.init();
  try {
    const scan = await library.loadDocument(bytes).catch((fault) => {
      throw new Error(`ocr: this ${media} does not open — ${fault.message}`);
    });
    for (const page of scan.pages()) {
      const { originalWidth, originalHeight } = page.getOriginalSize();
      const fitting = Math.floor((statics.extent * 72) / Math.max(originalWidth, originalHeight));
      const density = Math.min(settings.density, fitting);
      const { width, height, data } = await page.render({ scale: density / 72, render: "bitmap", colorSpace: "Gray" });
      const gray = { wide: width, tall: height, shades: data };
      const angle = skew(gray);
      yield [pack(angle === 0 ? gray : level(gray, angle)), angle === 0 ? upright : tilted(gray, angle), { density }];
    }
  } finally {
    library.destroy();
  }
}

const PAGES = [
  [(media) => /^application\/pdf\b/i.test(media), drawn],
  [(media) => /^image\//i.test(media), single],
];

const ENGINES = [
  [(statics) => statics.remote !== undefined, remote],
  [() => true, inline],
];

export default function provider(service) {
  const statics = { language: "eng", density: 300, extent: 6000, segmentation: 1, ...service.statics };
  const [, engine] = ENGINES.find(([matches]) => matches(statics));
  const open = engine({ ...service, statics });

  return async function* transcribe(source, given = {}) {
    const [fault] = v.faults(Source, source);
    if (fault) throw new Error(`ocr: invalid source ${fault.at}: ${fault.reason}`);
    const [refused] = v.faults(Settings, given);
    if (refused) throw new Error(`ocr: invalid settings ${refused.at}: ${refused.reason}`);
    const pages = PAGES.find(([matches]) => matches(source.media));
    if (pages === undefined) throw new Error(`ocr: ${source.media} is neither a pdf nor an image`);
    const settings = { language: statics.language, density: statics.density, ...given };
    const read = async function* () {
      let page = 0;
      let reader = null;
      try {
        for await (const [ink, placed, stated] of pages[1](statics, decodeBase64(source.data), settings, source.media)) {
          page += 1;
          reader ??= await open(settings.language);
          const tsv = await reader.read(ink, { segmentation: statics.segmentation, ...stated });
          for (const block of translate(tsv, page)) {
            yield { ...block, words: block.words.map((word) => ({ ...word, box: placed(word.box) })) };
          }
        }
      } finally {
        if (reader) await reader.close();
      }
    };
    yield* joined(read());
  };
}
