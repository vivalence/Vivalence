import provider from "./provider/index.js";
import { tools } from "./tools/index.js";

const manifest = {
  type: "service",
  slug: "ocr-tesseract",
  name: "Tesseract OCR service",
  description:
    "Reads a scan word for word — a pdf or an image in, verbatim events out, every word with its page, its box and its confidence. " +
    "The engine is tesseract: the server behind statics.remote when one is given (server/, its own container), " +
    "else tesseract as wasm from npm, fetched at the first read.",
  version: "0.1.0",
  traits: ["TOOLING"],
};

export { manifest, provider, tools };
