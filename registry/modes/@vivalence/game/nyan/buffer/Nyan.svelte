<script>
  import { Desk, ViewportLock } from "@vivalence/drapes";
  import wordsets from "../data/wordsets.json";
  import { DIVES, ORDERS, analyze, createRun, defaultConfig, press, project, sample } from "./engine.js";
  import Setup from "./panels/Setup.svelte";
  import Practice from "./panels/Practice.svelte";
  import Review from "./panels/Review.svelte";
  import Meter from "./panels/Meter.svelte";

  const { buffer, terminal } = $props();
  const { words: seedWords, ...seedConfig } = buffer.data ?? {};

  let game = $state({
    panel: "setup",
    dive: "graph",
    unit: "pairs",
    order: "damage",
    resolution: 10,
    config: defaultConfig(seedConfig),
    run: null,
    analysis: null,
  });

  // The run is words + config + an append-only keystroke log. Everything the UI
  // reads — cursor, marks, liveness — is projected from that log by project().
  const view = $derived(
    game.run ? project(game.run.words, game.run.config, game.run.log) : null,
  );

  function corpus(config) {
    if (config.source === "custom") return config.custom.split(/\s+/).filter(Boolean);
    const set = wordsets.sets.find((entry) => entry.name === config.source) ?? wordsets.sets[0];
    return set.text.split(/\s+/).filter(Boolean);
  }

  function start(words) {
    const pool = words ?? sample(corpus(game.config), game.config.count);
    if (!pool.length) return;
    game.run = createRun(pool, game.config);
    game.analysis = null;
    game.panel = "practice";
  }

  function finish() {
    const state = project(game.run.words, game.run.config, game.run.log);
    if (!state.events.length) return void (game.panel = "setup");
    game.analysis = analyze(state);
    game.dive = "graph";
    game.panel = "review";
  }

  function onKey(event) {
    const target = event.target;
    if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable)
      return;
    if (game.panel === "practice") {
      let character = null;
      if (event.key === "Backspace") character = "\x7f";
      else if (event.key === " ") character = " ";
      else if (event.key === "Enter") character = "\r";
      else if (event.key === "Escape") return finish();
      else if (event.key === "Dead") return event.preventDefault();
      else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey)
        character = event.key;
      if (character == null) return;
      event.preventDefault();
      press(game.run.log, character);
      const state = project(game.run.words, game.run.config, game.run.log);
      if (state.dead) return start(game.run.words);
      if (state.done) finish();
    } else if (game.panel === "review") {
      if (event.key === "r") start(game.run.words);
      else if (event.key === "n") start();
      else if (event.key === "s") game.panel = "setup";
      else if (event.key === "q") buffer.release?.();
      else if (event.key === "v") game.dive = DIVES[(DIVES.indexOf(game.dive) + 1) % DIVES.length];
      else if (game.analysis && "1234".includes(event.key))
        game.unit = Object.keys(game.analysis.units)[+event.key - 1];
      else if (event.key === "o") {
        const orders = Object.keys(ORDERS);
        game.order = orders[(orders.indexOf(game.order) + 1) % orders.length];
      }
    }
  }

  if (seedWords?.length) start(seedWords);
</script>

<ViewportLock />
<svelte:window onkeydown={onKey} />
<div class="mode">
  {#if game.panel === "practice" && game.config.live === "shown"}
    <Meter {view} />
  {/if}
  <Desk maxWidth="860px">
  {#snippet surface()}
    {#if game.panel === "setup"}
      <Setup {game} sets={wordsets.sets} />
    {:else if game.panel === "practice"}
      <Practice {view} />
    {:else if game.analysis}
      <Review {game} {view} />
    {/if}
  {/snippet}

  {#snippet controls()}
    {#if game.panel === "setup"}
      <button class="btn primary" onclick={() => start()}>Start →</button>
    {:else if game.panel === "practice"}
      <span class="hint">space = next word · esc = end</span>
    {:else}
      <button class="btn" onclick={() => start(game.run.words)}>r · same</button>
      <button class="btn" onclick={() => start()}>n · new</button>
      <button class="btn" onclick={() => (game.panel = "setup")}>s · setup</button>
      <button class="btn" onclick={() => buffer.release?.()}>q · quit</button>
    {/if}
  {/snippet}
  </Desk>
</div>

<style>
  .mode {
    position: relative;
    height: 100%;
    min-height: 0;
  }
  .hint {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-boundary);
  }
  .btn {
    min-height: 40px;
    padding: 0.5rem 0.9rem;
    border-radius: 0.375rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--colors-palette-gray-200);
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    cursor: pointer;
  }
  .btn.primary {
    border: none;
    background: var(--colors-theme-primary-surface);
    color: var(--colors-theme-primary-contrast);
    font-weight: 600;
  }
</style>
