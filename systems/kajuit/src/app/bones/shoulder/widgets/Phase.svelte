<script>
  // The Face — one dense shoulder widget: the render-phase FACE (vinca digram lever + name +
  // cursor) integrated with the CONTROLS that phase surfaces (thick Carbon icons) and the
  // integrity mark. Two registers: thin I-Ching lines for the STATE, bold icons for the VERBS.
  // Controls are contextual — each phase shows only the verbs that mean something.
  import { Icon } from "@vivalence/drapes";
  import { ThreadTraits } from "@vivalence/kajuit";

  let { terminal } = $props();

  // vinca — the four phases as I-Ching digrams, ordered by how much the stall does.
  const DIGRAM = { inert: "⚏", manual: "⚎", continuous: "⚌", escort: "⚍" };
  const ORDER = ["inert", "manual", "continuous", "escort"];

  // each phase surfaces a subset of the five stall verbs (depth is display + has no button).
  const CONTROLS = {
    inert: [],
    manual: ["prev", "next"],
    continuous: ["more", "stop"],
    escort: ["prev", "next", "home"],
  };
  const ICON = { prev: "ChevronLeft", next: "ChevronRight", home: "Undo", more: "Add", stop: "StopFilledAlt" };
  const LABEL = { prev: "previous", next: "next", home: "home", more: "more", stop: "stop → manual" };

  let phase = $state("manual");
  let integrity = $state({});
  let errors = $state([]);
  let buffers = $state([]);
  let activeId = $state(null);
  let menuOpen = $state(false);
  let keyEl = $state(null);
  let menuPos = $state({ left: 0, bottom: 0 });

  // measure the key on open so the menu can be position:fixed (escapes the pincer's overflow).
  function toggleMenu() {
    if (!menuOpen && keyEl) {
      const rect = keyEl.getBoundingClientRect();
      menuPos = { left: rect.left, bottom: window.innerHeight - rect.top + 6 };
    }
    menuOpen = !menuOpen;
  }

  // the 4 phases on an xy grid: rows = who manages (app · stall), cols = stillness → motion.
  const GRID = [
    ["inert", "manual"],
    ["continuous", "escort"],
  ];

  $effect(() => {
    const thread = terminal?.thread;
    if (!thread) return;
    const offs = [
      thread.$phase.subscribe((value) => (phase = value)),
      thread.$integrity?.subscribe?.((value) => (integrity = value ?? {})),
      thread.$errors?.subscribe?.((value) => (errors = value ?? [])),
      thread.$buffers?.subscribe?.((value) => (buffers = value ?? [])),
      terminal.$buffer.subscribe((value) => (activeId = value?.id ?? null)),
    ].filter(Boolean);
    return () => offs.forEach((off) => off());
  });

  const problems = (key) => integrity[key] ?? [];
  const flagged = $derived(errors.length > 0);
  const depth = $derived(terminal?.thread?.trait?.QUEUEING?.depth ?? 1);
  const showsCursor = $derived(phase === "manual" || phase === "escort");
  const at = $derived(buffers.findIndex((buffer) => buffer.id === activeId));

  function engage(key) {
    const thread = terminal?.thread;
    if (!thread || problems(key).length) return;
    if (thread.engage(key))
      thread.daemon.entities.thread.updateOne({ id: thread.id }, { phase: key });
  }
  function step(delta) {
    if (!buffers.length) return;
    terminal.buffer = buffers[(Math.max(at, 0) + delta + buffers.length) % buffers.length] ?? null;
  }
  function run(key) {
    if (key === "prev") step(-1);
    else if (key === "next") step(1);
    else if (key === "home") terminal.buffer = buffers[0] ?? null;
    else if (key === "more") ThreadTraits.aimed.pull(terminal.thread);
    else if (key === "stop") engage("manual");
  }

  // portal the menu to <body> — the shoulder's stacking context (z-index + overflow) would
  // otherwise clip/bury a fixed popup. body-level → it floats above everything.
  function portal(node) {
    document.body.appendChild(node);
    return { destroy: () => node.remove() };
  }
</script>

<div class="face">
  <!-- status — the integrity LED, leftmost -->
  <button
    class="ctl led status"
    class:flagged
    title={flagged ? errors.join(" · ") : "phase ok"}
    onclick={() => terminal.thread?.$errors?.set([])}>
    <Icon carbon={flagged ? "MisuseOutline" : "CheckmarkOutline"} size="sm" variant={flagged ? "danger" : "success"} />
  </button>

  <!-- label — the phase name IS the trigger (no icon); click opens the xy menu -->
  <button bind:this={keyEl} class="phasekey" class:active={activeId} class:open={menuOpen} title="render phase" onclick={toggleMenu}>
    <span class="name">{phase}</span>
  </button>

  <!-- controls — the phase's verbs -->
  {#if CONTROLS[phase].length}
    <span class="controls">
      {#each CONTROLS[phase] as key (key)}
        <button class="ctl" title={LABEL[key]} onclick={() => run(key)}>
          <Icon carbon={ICON[key]} size="sm" variant="ui" />
        </button>
      {/each}
    </span>
  {/if}

  <!-- queue — the queued buffers: position / total (+ depth target under QUEUEING) -->
  {#if buffers.length}
    <span class="queue" title="queue {at >= 0 ? at + 1 : '–'} of {buffers.length}{phase === 'continuous' ? ` · depth ${depth}` : ''}">
      <Icon carbon="DataBase" size="sm" variant="ui" />
      <span class="qpos">{at >= 0 ? at + 1 : "–"}/{buffers.length}</span>
    </span>
  {/if}

  {#if menuOpen}
    <div class="overlay" use:portal>
    <button class="scrim" onclick={() => (menuOpen = false)} aria-label="close"></button>
    <div class="menu" style:left="{menuPos.left}px" style:bottom="{menuPos.bottom}px">
      <div class="grid">
        {#each GRID as row}
          {#each row as key (key)}
            <button
              class="cell"
              class:on={phase === key}
              class:blocked={problems(key).length > 0}
              onclick={() => {
                engage(key);
                if (!problems(key).length) menuOpen = false;
              }}>
              <span class="cell-glyph">{DIGRAM[key]}</span>
              <span class="cell-name">{key}</span>
              {#if problems(key).length}<span class="cell-why">{problems(key).join(" · ")}</span>{/if}
            </button>
          {/each}
        {/each}
      </div>
      <div class="menu-foot">
        <span>queue <b>{buffers.length}</b></span>
        <span>depth <b>{depth}</b></span>
        <span class:bad={flagged}>{flagged ? `${errors.length} blocked` : "ok"}</span>
      </div>
    </div>
    </div>
  {/if}
</div>

<style>
  /* a compact control-panel face: flat recessed chassis, chunky flat keys, one control row.
     the phase collapses to ONE lit key; clicking it opens the xy phase menu above. */
  .face {
    position: relative;
    display: inline-flex;
    align-items: stretch;
    height: 30px;
    padding: 3px;
    gap: 4px;
    pointer-events: auto; /* .population sets none; its scoped `> *` rule can't cross into here */
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-contrast) 30%, transparent);
    border-radius: 5px;
    background: color-mix(in srgb, var(--mix-deep) 35%, var(--colors-skeleton-1-surface));
    font-family: var(--font-family-code);
  }

  /* the collapsed phase trigger — the label IS the button; lit display, click opens the menu */
  .phasekey {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    height: 22px;
    padding: 0 10px;
    border-radius: 3px;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-contrast) 22%, transparent);
    background: color-mix(in srgb, var(--mix-deep) 22%, var(--colors-skeleton-2-surface));
    cursor: pointer;
    transition: all 0.1s;
  }
  .phasekey:hover {
    border-color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 45%, transparent);
  }
  /* lit ONLY when a buffer is actually rendered; passive otherwise */
  .phasekey.active {
    border-color: var(--colors-skeleton-0-primary-base);
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 16%, transparent);
  }
  .phasekey.open {
    background: var(--colors-skeleton-0-primary-base);
    border-color: var(--colors-skeleton-0-primary-base);
    box-shadow: 0 0 8px color-mix(in srgb, var(--colors-skeleton-0-primary-base) 70%, transparent);
  }
  .name {
    font-size: var(--font-size-2xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--colors-skeleton-0-contrast);
    opacity: 0.6;
  }
  .phasekey.active .name {
    color: var(--colors-skeleton-0-primary-base);
    opacity: 1;
  }
  .phasekey.open .name {
    color: var(--colors-skeleton-0-surface);
    opacity: 1;
  }
  .cursor {
    font-size: var(--font-size-2xs);
    opacity: 0.6;
    padding: 1px 5px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--mix-deep) 30%, var(--colors-skeleton-2-surface));
  }

  /* one unified control row — chunky flat transport keys + the LED */
  .controls {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }
  .ctl {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    min-width: 24px;
    height: 22px;
    padding: 0 4px;
    border-radius: 3px;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-contrast) 16%, transparent);
    background: color-mix(in srgb, var(--mix-deep) 22%, var(--colors-skeleton-2-surface));
    color: var(--colors-skeleton-0-contrast);
    font: inherit;
    font-size: var(--font-size-2xs);
    cursor: pointer;
    transition: all 0.1s;
  }
  .ctl:hover {
    color: var(--colors-skeleton-0-primary-base);
    border-color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 50%, transparent);
  }
  .ctl:active {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 22%, var(--colors-skeleton-2-surface));
  }
  .depth {
    cursor: default;
    color: var(--colors-skeleton-0-primary-base);
  }
  /* the LED key — glows by state, no border */
  .led {
    border-color: transparent;
    background: none;
    cursor: default;
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--colors-skeleton-0-success-base) 55%, transparent));
  }
  .led.flagged {
    cursor: pointer;
    filter: drop-shadow(0 0 5px color-mix(in srgb, var(--colors-skeleton-0-danger-base) 70%, transparent));
  }

  /* queue — the queued-buffer readout (position / total), trailing */
  .queue {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0 4px;
    color: var(--colors-skeleton-0-primary-base);
  }
  .qpos {
    font-size: var(--font-size-2xs);
    letter-spacing: 0.04em;
    opacity: 0.85;
  }

  /* the xy phase menu — opens upward from the key; 2x2 grid + a readout foot */
  .scrim {
    position: fixed;
    inset: 0;
    background: none;
    border: none;
    z-index: 60;
    cursor: default;
  }
  .menu {
    position: fixed;
    z-index: 61;
    padding: 5px;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-contrast) 32%, transparent);
    border-radius: 6px;
    background: color-mix(in srgb, var(--mix-deep) 45%, var(--colors-skeleton-1-surface));
    box-shadow: 0 6px 18px var(--shadow-soft);
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    width: 15rem;
  }
  .cell {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-radius: 4px;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-contrast) 14%, transparent);
    background: color-mix(in srgb, var(--mix-deep) 22%, var(--colors-skeleton-2-surface));
    color: var(--colors-skeleton-0-contrast);
    font: inherit;
    cursor: pointer;
    text-align: left;
    transition: all 0.1s;
  }
  .cell:hover {
    border-color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 55%, transparent);
  }
  .cell.on {
    color: var(--colors-skeleton-0-surface);
    background: var(--colors-skeleton-0-primary-base);
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .cell.blocked {
    opacity: 0.55;
    cursor: not-allowed;
    border-color: color-mix(in srgb, var(--colors-skeleton-0-danger-base) 30%, transparent);
  }
  .cell-glyph {
    font-size: var(--font-size-md);
    line-height: 1;
  }
  .cell-name {
    font-size: var(--font-size-2xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .cell-why {
    grid-column: 1 / -1;
    font-size: var(--font-size-2xs);
    color: var(--colors-skeleton-0-danger-base);
    opacity: 0.85;
  }
  .menu-foot {
    display: flex;
    gap: 12px;
    margin-top: 6px;
    padding: 4px 4px 0;
    border-top: 1px solid color-mix(in srgb, var(--colors-skeleton-0-contrast) 14%, transparent);
    font-size: var(--font-size-2xs);
    opacity: 0.7;
  }
  .menu-foot b {
    color: var(--colors-skeleton-0-primary-base);
  }
  .menu-foot .bad {
    color: var(--colors-skeleton-0-danger-base);
    opacity: 1;
  }
</style>
