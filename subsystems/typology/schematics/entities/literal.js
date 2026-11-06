import { v } from "../v.js";
import * as traits from "../traits/index.js";
import { DataSchematic } from "./base.js";

export const LiteralSchematic = {
  ...DataSchematic,
  $id: "Literal",
  is: "one concrete thing of a daemon's dataset — a word, a card, a position — addressed by slug, described by its symbol",
  own: {
    slug: v.string().optional().desc("its address inside the daemon").examples("flamingo"),
    daemon: v.string().optional().desc("the daemon slug it belongs to").examples("education"),
    ontology: v.string().optional().desc("the topology it is a word of").examples("species"),
    traits: traits.names.literal.optional().desc("the trait names worn").examples(["LABELED"]),
    trait: traits.literal.default({}).optional().desc("trait data by name").examples({ LABELED: { name: "Flamingo — six species" } }),
    symbol: v.record(v.string(), v.unknown()).optional().desc("its symbolic description, keys of the topology").examples({ family: "Phoenicopteridae", continents: 4 }),
  },
  relations: {
    symbols: () => v.array(v.symbol()).optional().desc("the symbols that describe it"),
    mode: () => v.rel().optional().desc("the mode that ships it").examples("01a09010-13a9-7f1e-a2c4-6b0d1f2e3a44"),
    uses: () => v.array(v.literal()).optional().desc("literals it is built from"),
    in: () => v.array(v.literal()).optional().desc("literals built from it"),
    notes: () => v.array(v.note()).optional().desc("notes taken on it"),
  },
  narrowable: ["trait", "symbol"],
  examples: [{ id: "01a1b1c0-d500-778e-b1a8-70dbfcaea4e3", slug: "a00-amar-opening-8e08ab", traits: ["CATALOGUED"], trait: { CATALOGUED: { eco: "A00", name: "Amar Opening", pgn: "1. Nh3", moves: ["g1h3"], fen: "rnbqkbnr/pppppppp/8/8/8/7N/PPPPPPPP/RNBQKB1R b KQkq - 1 1", epd: "rnbqkbnr/pppppppp/8/8/8/7N/PPPPPPPP/RNBQKB1R b KQkq -", plies: 1 } }, symbol: { opening: { family: "A", eco: "A00" } }, ontology: "opening", daemon: "chess", mode: "01a1b1c0-d4bd-77de-95f4-e4b91bde31da" }],
};
