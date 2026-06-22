<script>
  import { atom } from "@vivalence/typology";

  const { terminal, buffer } = $props();

  const buffers = atom.chain(terminal, "$thread", "$buffers");
  const active = atom.chain(terminal, "$buffer");

  const stall = () => terminal.stall;
  const list = () => terminal.thread.$buffers.get();
  const isSpawned = (b) => b.mode?.slug === "spawned";
  const spawned = () => list().filter(isSpawned);
  const label = (b) => b.data?.label ?? b.mode?.slug ?? "—";

  // G1 is the counter-demo to the dealt group (G2): the APP owns its buffers. Only the two
  // SELF-MANAGED phases — NO AIMED, NO stall fetch. `free` = the stall does nothing and each
  // spawned self-evicts on done; `walk` = the stall does cursor discipline only, the app spawns.
  const PHASES = [
    { key: "inert", label: "free", hint: "stall does nothing; each spawned self-evicts on ✓" },
    { key: "manual", label: "walk", hint: "stall advances the cursor on ✓; the app spawns" },
  ];

  // live phase readout — the stall persists for the hub's thread, so one subscribe.
  let phase = $state("inert");
  $effect(() => stall()?.$phase.subscribe((p) => (phase = p)));

  // emit — the one source. fires the spawner's emitter → 2 spawned render targets.
  async function emit() {
    await buffer.mode.emit.playground.spawn({ thread: terminal.thread.id });
  }

  // drive the THREAD's phase through the integrity gate (engage), then persist. .only scopes
  // the stall's cursor to spawned cards (hub + cards share one thread). manual seizes the moat
  // onto the first card so ✓complete rides the terminal's release hook.
  function setPhase(key) {
    stall()?.only(isSpawned);
    if (!terminal.thread.engage(key)) return;
    terminal.thread.daemon.entities.thread.updateOne({ id: terminal.thread.id }, { phase: key });
    if (key === "manual") terminal.buffer = spawned()[0] ?? buffer;
  }

  // click a row to render it. under `free` (inert) ✓complete still works, self-evicting.
  function openBuffer(b) {
    terminal.buffer = terminal.buffer?.id === b.id ? null : b;
  }
</script>

<div class="spawner">
  <div class="tag">playground · spawner</div>

  <div class="state">
    <span>phase <b>{phase}</b></span>
    <span>spawned <b>{$buffers.filter(isSpawned).length}</b></span>
  </div>

  <div class="row">
    <button onclick={emit}>spawn</button>
  </div>

  <div class="row">
    {#each PHASES as p (p.key)}
      <button class:on={phase === p.key} title={p.hint} onclick={() => setPhase(p.key)}>{p.label}</button>
    {/each}
  </div>

  <p class="hint">
    the APP owns these buffers — no fetch. <b>spawn</b> tops up the queue; <b>free</b> lets each
    card self-evict on ✓; <b>walk</b> lets the stall advance the cursor on ✓.
  </p>

  <ul class="list">
    {#each $buffers as b (b.id)}
      <li class:active={$active?.id === b.id}>
        <button onclick={() => openBuffer(b)}>
          <span class="dot" class:on={$active?.id === b.id}></span>
          {label(b)}
        </button>
      </li>
    {/each}
  </ul>

</div>

<style>
  .spawner {
    min-height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    padding: 18px;
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
  }
  .tag {
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--colors-skeleton-0-primary-base);
  }
  .state {
    display: flex;
    gap: 1rem;
    font-size: var(--font-size-2xs);
    opacity: 0.65;
  }
  .state b {
    color: var(--colors-skeleton-0-primary-base);
    font-weight: 600;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .row button {
    padding: 0.35rem 0.9rem;
    font-family: inherit;
    font-size: var(--font-size-2xs);
    color: inherit;
    background: transparent;
    border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
    border-radius: 0.3rem;
    cursor: pointer;
    opacity: 0.8;
  }
  .row button:hover {
    opacity: 1;
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .row button.on {
    opacity: 1;
    color: var(--colors-skeleton-0-primary-base);
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .hint {
    max-width: 20rem;
    margin: 0;
    font-size: var(--font-size-2xs);
    line-height: 1.4;
    opacity: 0.55;
    text-align: center;
  }
  .hint b {
    color: var(--colors-skeleton-0-primary-base);
    font-weight: 600;
    opacity: 0.9;
  }
  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    width: 13rem;
  }
  .list li {
    border: 1px solid transparent;
    border-radius: 0.25rem;
  }
  .list li.active {
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .list button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0.6rem;
    font-family: inherit;
    font-size: var(--font-size-xs);
    color: inherit;
    background: transparent;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    text-align: left;
  }
  .dot {
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.25;
  }
  .dot.on {
    opacity: 1;
    color: var(--colors-skeleton-0-primary-base);
  }
</style>
