import { v } from "../v.js";
import * as mime from "../scalars/mime.js";
import { DataSchematic } from "./base.js";

const MISSING = v.object({
  since: v.string().desc("when the patrol first found the mount gone, ISO 8601").examples("2026-10-21T09:00:00Z"),
});

export const FileSchematic = {
  ...DataSchematic,
  $id: "File",
  is: "one file a mode serves: a path inside the mode, bytes on disk, their hash and integrity",
  own: {
    path: v.string().desc("the file's path inside its mode, one row per (mode, path)").examples("board.js"),
    mount: v.string().desc("where the bytes sit on disk, absolute").examples("/home/beef/.viva/instances/chess/mountpoint/board/play/board.js"),
    mime: mime.type().desc("what the bytes are").examples("text/javascript"),
    hash: v.string().desc("the sha256 of the current bytes, hex").examples("9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"),
    integrity: v.string().desc("the subresource integrity the client checks the fetch against").examples("sha256-n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg="),
    bytes: v.integer().default(0).optional().desc("the size of the bytes").examples(4096),
    traits: v.array(v.enum(["MISSING"])).optional().desc("the trait names worn").examples([]),
    trait: v.record(v.string(), v.unknown()).optional().desc("trait data by name").examples({}),
  },
  relations: {
    mode: () => v.rel().desc("the mode that serves it").examples("01a09010-13a9-7f1e-a2c4-6b0d1f2e3a44"),
    view: () => v.rel().optional().desc("the view it belongs to"),
    buffers: () => v.array(v.buffer()).optional().desc("buffers that show it"),
  },
  traits: v.object({ MISSING: MISSING.default({}).optional().desc("the patrol found its mount gone").examples({ since: "2026-10-21T09:00:00Z" }) }),
  narrowable: ["trait"],
  spoken: ["id", "path", "mime", "mode", "view", "bytes"],
  examples: [{ id: "01a1b1c0-e5fa-776b-b1aa-1ec226521760", path: "sentences/abre-la-puerta.mp3", mount: "/Users/finn/.viva/registry/education/topographies/english-to-spanish/freight/audio/sentences/abre-la-puerta.mp3", mime: "audio/mpeg", hash: "1a060121d48a320340ae0f31239912def2611720643d136164750badd1c07c12", integrity: "sha256-1a060121d48a320340ae0f31239912def2611720643d136164750badd1c07c12", bytes: 17802, traits: [], trait: {}, mode: "01a1b1c0-d438-72ef-a942-832e1ebb5f29", view: null }],
};
