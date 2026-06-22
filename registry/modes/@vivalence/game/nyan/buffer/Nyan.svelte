<script>
  import { Desk, ViewportLock } from "@vivalence/drapes";
  import wordsets from "../data/wordsets.json";
  import { DIVES, ORDERS, analyze, createRun, defaultConfig, press, project } from "./engine.js";
  import Home from "./panels/Home.svelte";
  import Practice from "./panels/Practice.svelte";
  import Meter from "./panels/Meter.svelte";

  const { buffer, terminal } = $props();
  const { words: seedWords, owners: seedOwners, ...seedConfig } = buffer.data ?? {};
  const literals = buffer.literals;

  // ── provenance · the app's type, derived once ────────────────────────────────
  // domain → words are a projection of literals (graded back to memory)
  // fixed  → an explicit plaintext list (the list IS the content)
  // corpus → drawn from a wordset; the open standalone trainer
  const kind = literals?.length ? "domain" : seedWords?.length ? "fixed" : "corpus";

  function corpus(config) {
    if (config.source === "custom") return config.custom?.split(/\s+/).filter(Boolean) ?? [];
    const set = wordsets.sets.find((entry) => entry.name === config.source) ?? wordsets.sets[0];
    return set.text.split(/\s+/).filter(Boolean);
  }
  const sourceLabel = () =>
    wordsets.sets.find((entry) => entry.name === game.config.source)?.label ?? game.config.source;

  // each provenance declares its settings + its review re-run verbs; the lobby and
  // the control bar render from this, never from inline branches (effect-over-model).
  const PROVENANCE = {
    domain: {
      label: () => `${literals.length} literals → ${seedWords.length} words`,
      settings: ["count", "order", "gameplay", "forgiving"],
      replays: ["repeat", "shuffle"],
    },
    fixed: {
      label: () => `plain · ${seedWords.length} words`,
      settings: ["gameplay", "forgiving"],
      replays: ["repeat"],
    },
    corpus: {
      label: () => `corpus · ${sourceLabel()}`,
      settings: ["source", "count", "gameplay", "forgiving"],
      replays: ["repeat", "new"],
    },
  };
  const prov = PROVENANCE[kind];

  // ── the plan · source × settings → a paired {words, owners} ───────────────────
  // owners ride WITH words through shuffle/sample, so the grade alignment is
  // structural — it cannot drift the way a frozen top-level owners[] would.
  const shufflePairs = (pairs) =>
    pairs
      .map((pair) => [Math.random(), pair])
      .sort((a, b) => a[0] - b[0])
      .map((pair) => pair[1]);
  const resampleTo = (pairs, count) => {
    const shuffled = shufflePairs(pairs);
    return shufflePairs(Array.from({ length: count }, (_, index) => shuffled[index % shuffled.length]));
  };

  function sourcePairs() {
    if (kind === "corpus") return corpus(game.config).map((word) => ({ word, owner: "" }));
    return (seedWords ?? []).map((word, index) => ({ word, owner: seedOwners?.[index] ?? "" }));
  }

  function plan({ order = "given", count } = {}) {
    let pairs = sourcePairs();
    if (order === "shuffle") pairs = shufflePairs(pairs);
    // corpus may exceed its sample (it cycles a large pool); a fixed/domain buffer
    // clamps to its own size so resample never duplicates the same word.
    if (count) pairs = resampleTo(pairs, kind === "corpus" ? count : Math.min(count, pairs.length));
    return { words: pairs.map((pair) => pair.word), owners: pairs.map((pair) => pair.owner) };
  }

  // ── domain egress · a per-word verdict → a memory signal ──────────────────────
  // clean is the only win; recall (couldn't retrieve) is worst; spelling AND motor
  // slips are negative — the motor channel is exactly what nyan trains.
  const SIGNAL = (label) =>
    label === "clean" ? "SUCCESS" : label === "recall" ? "FAILURE" : "MISTAKE";

  function grade(analysis) {
    if (!game.owners?.some(Boolean) || !analysis) return;
    for (const attempt of analysis.attempts) {
      const literal = game.owners[attempt.wordIndex];
      if (!literal) continue; // "" = untracked function word
      terminal.daemon.call("/review/literal", { literal, signal: SIGNAL(attempt.label) });
    }
  }

  // ── session state ─────────────────────────────────────────────────────────────
  // config.order/count drive plan(); game.order/unit/dive/resolution are the
  // review-dive picks (distinct axes — don't conflate config.order with game.order).
  let game = $state({
    phase: "home",
    config: defaultConfig({ ...seedConfig, order: kind === "domain" ? "shuffle" : "given" }),
    run: null,
    owners: null,
    lastPlan: null,
    analysis: null,
    dive: "graph",
    unit: "pairs",
    order: "damage",
    resolution: 10,
  });

  // the run is words + config + an append-only keystroke log; everything the UI
  // reads is projected from that log by project().
  const view = $derived(
    game.run ? project(game.run.words, game.run.config, game.run.log) : null,
  );

  const contextLine = $derived(
    game.phase === "practice"
      ? view?.startedAt == null
        ? "starts on first key"
        : `${view.wordIndex}/${view.words.length}`
      : prov.label(),
  );
  // practice is the only centered phase; home is a top-aligned multi-section form.
  const centered = $derived(game.phase === "practice");

  function launch(chosen) {
    if (!chosen?.words.length) return;
    game.lastPlan = chosen;
    game.run = createRun(chosen.words, game.config);
    game.owners = chosen.owners;
    game.analysis = null;
    game.phase = "practice";
  }

  function finish() {
    const state = project(game.run.words, game.run.config, game.run.log);
    if (!state.events.length) return void (game.phase = "home");
    game.analysis = analyze(state);
    grade(game.analysis); // domain buffers only (owners present); generic runs no-op
    game.dive = "graph";
    game.phase = "home"; // home gains its results section once analysis exists
  }

  // ── actions · one table feeds the control bar AND the keymap (no drift) ───────
  const ACTIONS = {
    start: { key: "Enter", hint: "⏎", label: "start", run: () => launch(plan({ order: game.config.order, count: prov.settings.includes("count") ? game.config.count : undefined })) },
    repeat: { key: "r", hint: "r", label: "repeat", run: () => launch(game.lastPlan) },
    shuffle: { key: "s", hint: "s", label: "shuffle", run: () => launch(plan({ order: "shuffle", count: game.config.count })) },
    new: { key: "n", hint: "n", label: "new", run: () => launch(plan({ order: "shuffle", count: game.config.count })) },
    quit: { key: "q", hint: "q", label: "quit", run: () => buffer.release?.() },
  };
  // home is the one hub: start always; the provenance replays appear once there's a
  // last run to replay; quit always. practice shows only a hint.
  const PHASES = {
    home: { controls: () => ["start", ...(game.lastPlan ? prov.replays : []), "quit"] },
    practice: { controls: () => [] },
  };

  // review-dive navigation (panel-internal axes, not control-bar buttons)
  function diveKeys(event) {
    if (event.key === "v") game.dive = DIVES[(DIVES.indexOf(game.dive) + 1) % DIVES.length];
    else if (game.analysis && "1234".includes(event.key))
      game.unit = Object.keys(game.analysis.units)[+event.key - 1];
    else if (event.key === "o") {
      const orders = Object.keys(ORDERS);
      game.order = orders[(orders.indexOf(game.order) + 1) % orders.length];
    }
  }

  function onKey(event) {
    const target = event.target;
    if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable)
      return;

    if (game.phase === "practice") {
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
      if (state.dead) return launch(game.lastPlan); // sudden-death restart, same plan
      if (state.done) finish();
      return;
    }

    // lobby / review: the active phase's controls ARE the keymap.
    const action = PHASES[game.phase]
      .controls()
      .map((name) => ACTIONS[name])
      .find((entry) => entry.key === event.key);
    if (action) {
      event.preventDefault();
      action.run();
      return;
    }
    if (game.phase === "home" && game.analysis) diveKeys(event);
  }
</script>

<ViewportLock />
<svelte:window onkeydown={onKey} />
<div class="mode">
  {#if game.phase === "practice" && game.config.live === "shown"}
    <Meter {view} />
  {/if}
  <Desk maxWidth="860px" class="nyan-desk">
    {#snippet surface()}
      <div class="app">
        <header class="chrome">
          <span class="brand">Nyan</span>
          <span class="sep">·</span>
          <span class="phase">{game.phase}</span>
          {#if contextLine}<span class="ctx">{contextLine}</span>{/if}
        </header>
        <div class="panel" class:center={centered}>
          {#if game.phase === "practice"}
            <Practice {view} />
          {:else}
            <Home {game} {prov} {view} {literals} words={seedWords} {kind} sets={wordsets.sets} />
          {/if}
        </div>
      </div>
    {/snippet}

    {#snippet controls()}
      {#if game.phase === "practice"}
        <span class="hint">space = next word · esc = end</span>
      {:else}
        {#each PHASES[game.phase].controls() as name}
          {@const action = ACTIONS[name]}
          <button class="btn" class:primary={name === "start"} onclick={action.run}>
            <span class="k">{action.hint}</span>
            {action.label}
          </button>
        {/each}
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
  /* one chrome for every phase — centered surface for lobby/practice */
  .mode :global(.nyan-desk .desk-stage) {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }
  .app {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    min-height: 0;
  }
  .chrome {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
  }
  .brand {
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--colors-theme-primary-contrast);
  }
  .sep {
    color: var(--colors-skeleton-1-boundary);
  }
  .phase {
    color: var(--colors-palette-gray-10);
  }
  .ctx {
    margin-left: auto;
    color: var(--colors-skeleton-1-boundary);
  }
  .panel {
    flex: 1;
    min-height: 0;
  }
  .panel.center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .hint {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-boundary);
  }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
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
  .btn .k {
    padding: 0.05rem 0.35rem;
    border-radius: 0.25rem;
    background: color-mix(in srgb, var(--colors-skeleton-1-boundary) 25%, transparent);
    color: var(--colors-skeleton-1-boundary);
    font-size: var(--font-size-xs);
  }
  .btn.primary {
    border: none;
    background: var(--colors-theme-primary-surface);
    color: var(--colors-theme-primary-contrast);
    font-weight: 600;
  }
  .btn.primary .k {
    background: color-mix(in srgb, var(--colors-theme-primary-contrast) 22%, transparent);
    color: var(--colors-theme-primary-contrast);
  }
</style>
