import { v } from "../v.js";
import * as mime from "../scalars/mime.js";

const MISSING = v.object({
  since: v.string().desc('When the patrol first found the mount gone, ISO 8601. Example: "2026-10-21T09:00:00Z"'),
});

export const FileDescriptor = {
  $id: "File",
  own: {
    path: v.string().desc('The file\'s path inside its mode, one row per (mode, path). Example: "board.js"'),
    mount: v.string().desc('Where the bytes sit on disk, absolute. Example: "/home/beef/.viva/instances/chess/mountpoint/board/play/board.js"'),
    mime: mime.type().desc('What the bytes are. Example: "text/javascript"'),
    hash: v.string().desc('The sha256 of the current bytes, hex. Example: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"'),
    integrity: v.string().desc('The subresource integrity the client checks the fetch against. Example: "sha256-n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg="'),
    bytes: v.integer().default(0).optional().desc("The size of the bytes. Example: 4096"),
    traits: v.array(v.string()).optional(),
    trait: v.record(v.string(), v.unknown()).optional(),
  },
  relations: {
    mode: () => v.rel(v.mode()),
    view: () => v.rel(v.view()).optional(),
    buffers: () => v.array(v.buffer()).optional(),
  },
  traits: v.object({ MISSING: MISSING.default({}).optional() }),
  narrowable: ["trait"],
  spoken: ["id", "path", "mime", "mode", "view", "bytes"],
};
