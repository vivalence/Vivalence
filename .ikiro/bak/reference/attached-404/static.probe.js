// limit: 2000 chars
import { Aperture, shape, shard, Vector } from "@vivalence/typology";

const attachment = new Vector();
attachment.branch("/file/:id").use(shard.datamap.errors()).do(async (input, ctx) => `${ctx.runtime.slug}: bytes of ${ctx.params.id}`);

const root = new Aperture();
const runtime = { slug: "runtime", services: { tesseract: new Vector().open("/status", () => ({ code: "RUNNING" })) } };
const hit = async (path) => {
  const response = await shape.http(root)(new Request(`http://probe.invalid${path}`));
  return { status: response.status, body: await response.text() };
};
const seen = [];

root.branch("/attached").use(shard.context.bind("runtime", runtime)).graft(attachment);
seen.push({ step: "the runtime's attachment grafted, runtime bound", file: await hit("/attached/file/f-1") });

root.branch("/attached/process/service/ocr/tesseract", runtime.services.tesseract);
seen.push({ step: "a service joins later", file: await hit("/attached/file/f-1"), service: await hit("/attached/process/service/ocr/tesseract/status") });
console.log(JSON.stringify(seen, null, 2));
