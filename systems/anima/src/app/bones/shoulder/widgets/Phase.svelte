<script>
  import { Float, Key, Row } from "@vivalence/drapes";
  import { ThreadTraits } from "@vivalence/anima";
  import { bufferLabel } from "../../../panels/a/widgets/turns.js";

  let { terminal, axis, side = "below", open = false, title = "buffers", ontoggle } = $props();

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
  const LABEL = { prev: "previous", next: "next", home: "home", more: "more", stop: "stop → manual" };
  const FACE = { prev: "‹ prev", next: "next ›", home: "home", more: "+ more", stop: "stop" };

  let phase = $state("manual");
  let integrity = $state({});
  let errors = $state([]);
  let buffers = $state([]);
  let activeId = $state(null);
  let anchor = $state(null);

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
</script>

<span class="anchor" bind:this={anchor}>
  <Key size="bone" stack={axis === "column"} latched={open} title="render phase · {phase}" onclick={ontoggle}>
    <span class="digram">{DIGRAM[phase]}</span>
    <span class="position">{at >= 0 ? at + 1 : "—"}/{buffers.length}</span>
  </Key>
</span>

{#if open}
  <Float {anchor} zone="0" {title} {side} onclose={ontoggle}>
    <div class="phases">
      {#each GRID as pair, line (line)}
        {#each pair as key (key)}
          <Key
            size="row"
            wide
            latched={phase === key}
            muted={problems(key).length > 0}
            title={problems(key).join(" · ") || null}
            onclick={() => engage(key)}>
            <span class="digram">{DIGRAM[key]}</span>
            {key}
          </Key>
        {/each}
      {/each}
    </div>
    {#each ORDER.filter((key) => problems(key).length) as key (key)}
      <span class="refused">{key} · {problems(key).join(" · ")}</span>
    {/each}
    <div class="verbs">
      {#each CONTROLS[phase] as key (key)}
        <Key size="row" label={FACE[key]} title={LABEL[key]} onclick={() => run(key)} />
      {/each}
      <Key size="row" label="release" title="release the buffer under the cursor" disabled={at < 0} onclick={() => terminal.buffer?.release()} />
    </div>
    <div class="queue">
      {#each buffers as buffer, index (buffer.id)}
        <Row selected={buffer.id === activeId} onclick={() => (terminal.buffer = buffer)}>
          <span class="cursor">{buffer.id === activeId ? "▸" : ""}</span>
          <span class="index">{index + 1}</span>
          <span class="name">{bufferLabel(buffer)}</span>
        </Row>
      {:else}
        <span class="none">no buffers</span>
      {/each}
    </div>
    <div class="foot">
      <span>queue {buffers.length}</span>
      <span>depth {depth}</span>
    </div>
    {#if flagged}
      <button class="faults" title="clear" onclick={() => terminal.thread?.$errors?.set([])}>{errors.join(" · ")}</button>
    {/if}
  </Float>
{/if}

<style>
  .anchor {
    display: inline-flex;
    padding-bottom: var(--size-depth);
    pointer-events: auto;
  }
  .digram {
    font-size: 15px;
    line-height: 1;
    letter-spacing: 0;
  }
  .position {
    font-variant-numeric: tabular-nums;
  }
  .phases {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    padding-bottom: var(--size-depth);
  }
  .refused {
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--signal-caution-ink);
  }
  .verbs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-bottom: var(--size-depth);
  }
  .queue {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .cursor {
    flex: none;
    width: 8px;
    color: var(--signal-primary-ink);
  }
  .index {
    flex: none;
    min-width: 16px;
    color: var(--text-light);
    font-variant-numeric: tabular-nums;
  }
  .name {
    flex: 1 1 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-strong);
  }
  .none,
  .foot {
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-light);
  }
  .none {
    padding: 6px 8px;
  }
  .foot {
    display: flex;
    gap: 14px;
  }
  .faults {
    padding: 6px 10px;
    border: none;
    border-radius: var(--shape-radius-key);
    background: none;
    box-shadow: inset 0 0 0 var(--size-ring) var(--signal-negative);
    color: var(--signal-negative-ink);
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    text-align: left;
    cursor: pointer;
  }
</style>
