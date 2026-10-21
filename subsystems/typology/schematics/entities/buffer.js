import { v } from "../v.js";
import * as mime from "../scalars/mime.js";
import { buffer } from "../traits/index.js";

export const BufferDescriptor = {
  $id: "Buffer",
  own: {
    index: v.integer().default(0).optional(),
    mime: mime.type().optional().desc('The buffer\'s kind: the fallback renderers key on it; a mode mints its own. Example: "application/vnd.viva.daemon.chess.mode.board.play+json"'),
    data: v.record(v.string(), v.unknown()).optional(),
    traits: v.array(v.string()).optional(),
    trait: v.record(v.string(), v.unknown()).optional(),
  },
  relations: {
    mode: () => v.rel(v.mode()).optional(),
    thread: () => v.rel(v.thread()),
    turns: () => v.array(v.turn()).optional(),
    files: () => v.array(v.file()).optional(),
    views: () => v.array(v.view()).optional(),
    literals: () => v.array(v.literal()).optional(),
    symbols: () => v.array(v.symbol()).optional(),
  },
  traits: buffer,
  narrowable: ["data", "trait"],
  spoken: ["id", "index", "mime", "mode", "thread", "traits", "trait"],
};
