import { BufferView } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "speed-judge",
  traits: ["TERMINAL", "BUFFERED"],
};

const buffer = new BufferView("buffer/SpeedJudge.svelte");

export { manifest, buffer };
