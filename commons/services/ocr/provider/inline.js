import { join } from "@std/path";
import { bitmap, pack } from "./level.js";

const ENGINE = "npm:tesseract.js@7.0.0";
const shelf = (code) => `npm:@tesseract.js-data/${code}@1.0.0`;

const PARAMETERS = { segmentation: "tessedit_pageseg_mode", density: "user_defined_dpi" };

const packed = (code) => `${code}.traineddata.gz`;

async function shelved(code) {
  const { default: held } = await import(shelf(code)).catch((fault) => {
    throw new Error(`ocr: the engine holds no ${code} — ${fault.message.split("\n")[0]}`);
  });
  return join(held.langPath, packed(code));
}

async function unpacked(path) {
  const stream = (await Deno.open(path)).readable.pipeThrough(new DecompressionStream("gzip"));
  return await new Response(stream).bytes();
}

const INKS = [
  [(ink) => ink[0] === 0x42 && ink[1] === 0x4d, (ink) => pack(bitmap(ink))],
  [() => true, (ink) => ink],
];

const refused = (fault) => {
  throw new Error(`ocr: ${fault}`);
};

export const inline = () => async (language) => {
  const { createWorker } = await import(ENGINE);
  const codes = language.split("+");
  const [turned, ...spoken] = await Promise.all(["osd", ...codes].map(shelved));
  const folder = await Deno.makeTempDir({ prefix: "ocr-" });
  try {
    await Promise.all(spoken.map((path, index) => Deno.symlink(path, join(folder, packed(codes[index])))));
    const options = { langPath: folder, cacheMethod: "none", errorHandler: () => undefined };
    const worker = await createWorker(codes, 1, options).catch(refused);
    await worker.FS("writeFile", ["osd.traineddata", await unpacked(turned)]);
    await worker.setParameters({ debug_file: "/dev/null" });

    return {
      async read(ink, stated) {
        const parameters = Object.entries(stated).map(([name, value]) => [PARAMETERS[name], String(value)]);
        await worker.setParameters(Object.fromEntries(parameters));
        const [, readable] = INKS.find(([matches]) => matches(ink));
        const { data } = await worker.recognize(readable(ink), {}, { text: false, tsv: true }).catch(refused);
        return data.tsv;
      },
      close: () => worker.terminate(),
    };
  } finally {
    await Deno.remove(folder, { recursive: true });
  }
};
