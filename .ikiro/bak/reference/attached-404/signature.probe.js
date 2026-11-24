// limit: 1500 chars
import { Aperture, Path, shape, Vector } from "@vivalence/typology";

const reference = new Path("/attached/process/service/ocr/tesseract");
const attachment = () => new Vector().open("/status", () => ({ code: "RUNNING" }));
const seen = [];
for (const [label, signature] of [["reference.absolute", reference.absolute], ["reference.nature", reference.nature], ["reference", reference]]) {
  const root = new Aperture();
  try {
    root.branch(signature, attachment());
    seen.push({ passed: label, value: String(signature), strip: JSON.stringify(shape.strip(root)) });
  } catch (error) {
    seen.push({ passed: label, value: String(signature), threw: error.message });
  }
}
console.log(JSON.stringify(seen, null, 2));

const traced = new Path("/attached").branch("/process/service/ocr/tesseract");
const root = new Aperture();
root.branch(traced, attachment());
console.log(JSON.stringify({ passed: "a traced reference", absolute: traced.absolute, nature: traced.nature, strip: JSON.stringify(shape.strip(root)) }, null, 2));

const branched = new Path("/runtime/runtime");
branched.branch("/mode/reader/reader");
const held = new Aperture();
held.branch(branched, attachment());
console.log(JSON.stringify({ passed: "a reference its owner already branched", strip: JSON.stringify(shape.strip(held)) }, null, 2));
