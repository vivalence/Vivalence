import { BufferView } from "@vivalence/typology";
const manifest = { type: "game", slug: "match", traits: ["TERMINAL", "BUFFERED"] };
const buffer = new BufferView("buffer/Match.svelte");
export { manifest, buffer };
