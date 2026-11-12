// limit: 2500 chars
import { Aperture, shape, shard, Vector } from "@vivalence/typology";

const root = new Aperture();
const slot = new Vector();
root.branch("/attached", slot);

const hit = async (path) => (await shape.http(root)(new Request(`http://probe.invalid${path}`))).status;
const seen = [];

seen.push({ step: "slot mounted, empty", file: await hit("/attached/file/f-1"), service: await hit("/attached/process/service/ocr/tesseract/status") });

slot.branch("/file/:id").use(shard.datamap.errors()).do(async (input, ctx) => `bytes of ${ctx.params.id}`);
seen.push({ step: "file route opened on the slot", file: await hit("/attached/file/f-1"), service: await hit("/attached/process/service/ocr/tesseract/status") });

const attachment = new Vector().open("/status", () => ({ code: "RUNNING" }));
root.branch("/attached/process/service/ocr/tesseract", attachment);
seen.push({ step: "a service attachment grafted by its reference", file: await hit("/attached/file/f-1"), service: await hit("/attached/process/service/ocr/tesseract/status") });

seen.push({ step: "the slot holds both", slot: shape.strip(slot) });
console.log(JSON.stringify(seen, null, 2));
