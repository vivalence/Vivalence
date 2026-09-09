import { v, Vector } from "@vivalence/typology";

const RENDER = [
  "Render a live interface for the user — submit a COMPLETE Svelte 5 component as `source`.",
  "",
  "RULES: runes only ($props/$state/$derived/$effect); `let { buffer, terminal } = $props();`",
  '(payload at buffer.data); imports only "svelte"/"nanostores"; scoped <style>, no global CSS;',
  "root fills + scrolls (height:100%; overflow-y:auto); build real controls as $state.",
  "",
  "EXAMPLE source:",
  "<script>let { buffer } = $props(); let n = $state(0);</script>",
  "<button onclick={() => n++}>{buffer.data.label}: {n}</button>",
  "<style>button { font-size: 1.2rem; }</style>",
].join("\n");

export const generator = new Vector();

generator.branch("/view").open({
  nature: "/render",
  valence: RENDER,
  input: v.object({ source: v.string(), data: v.any().optional() }),
});
