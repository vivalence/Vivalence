<script>
  import { atom } from "@vivalence/typology";

  const { terminal, buffer } = $props();

  const phase = atom.chain(terminal, "$thread", "$phase");
  const buffers = atom.chain(terminal, "$thread", "$buffers");

  const isCard = (b) => b.mode?.slug === "card";
  const hand = () => (terminal.thread?.$buffers.get() ?? []).filter(isCard);

  // the four phases, in the dealer's language. each is one thread.phase write.
  const PHASES = [
    { key: "inert", label: "closed", hint: "table closed — cards ignored" },
    { key: "manual", label: "deal", hint: "play the hand, advance on play (no refill)" },
    { key: "continuous", label: "running", hint: "keep the hand topped up to depth" },
    { key: "escort", label: "round", hint: "seize the table, return to the dealer on drain" },
  ];

  function setPhase(key) {
    terminal.stall?.only(isCard); // scope the cursor to cards (the hub stays unselectable)
    terminal.thread.phase = key; // live → the stall re-engages
    terminal.thread.daemon.entities.thread.updateOne({ id: terminal.thread.id }, { phase: key });
    if (key !== "inert") terminal.buffer = hand()[0] ?? buffer;
  }

  // deal — deterministic, off the finite deck (drains to EXHAUSTED).
  async function deal() {
    await buffer.mode.emit.deal({ thread: terminal.thread.id });
  }
  // oracle — the dealer picks a themed hand via its harness (agentic).
  let theme = $state("");
  async function oracle() {
    await buffer.mode.emit.oracle({ thread: terminal.thread.id, focus: theme || undefined });
  }
</script>

<div class="dealer">
  <div class="tag">playground · dealer</div>

  <div class="readout">
    <span>phase <b>{$phase ?? "—"}</b></span>
    <span>hand <b>{($buffers ?? []).filter(isCard).length}</b></span>
    <!-- reserved: config-integrity stack (unbuilt — see §gaps) -->
    <span class="muted">errors <b>0</b></span>
  </div>

  <div class="row">
    <button onclick={deal}>deal</button>
    <label class="theme">theme <input bind:value={theme} placeholder="reds…" /></label>
    <button onclick={oracle}>oracle</button>
  </div>

  <div class="phases">
    {#each PHASES as p (p.key)}
      <button class:on={$phase === p.key} title={p.hint} onclick={() => setPhase(p.key)}>{p.label}</button>
    {/each}
  </div>

  <ul class="hand">
    {#each ($buffers ?? []).filter(isCard) as c (c.id)}
      <li class:active={terminal.buffer?.id === c.id}>
        <button onclick={() => (terminal.buffer = terminal.buffer?.id === c.id ? null : c)}>
          {c.data?.face ?? "?"}
        </button>
      </li>
    {/each}
  </ul>
</div>

<style>
  .dealer {
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
  .readout {
    display: flex;
    gap: 1rem;
    font-size: var(--font-size-2xs);
    opacity: 0.7;
  }
  .readout b {
    color: var(--colors-skeleton-0-primary-base);
    font-weight: 600;
  }
  .readout .muted b {
    color: inherit;
    opacity: 0.5;
  }
  .row,
  .phases {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  button {
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
  button:hover {
    opacity: 1;
    border-color: var(--colors-skeleton-0-primary-base);
  }
  button.on {
    opacity: 1;
    color: var(--colors-skeleton-0-primary-base);
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .theme {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: var(--font-size-2xs);
    opacity: 0.7;
  }
  .theme input {
    width: 5rem;
    font: inherit;
    font-size: var(--font-size-2xs);
    color: var(--colors-skeleton-0-primary-base);
    background: transparent;
    border: none;
    border-bottom: 1px solid color-mix(in srgb, currentColor 30%, transparent);
  }
  .hand {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    justify-content: center;
    max-width: 16rem;
  }
  .hand li.active button {
    color: var(--colors-skeleton-0-primary-base);
    border-color: var(--colors-skeleton-0-primary-base);
  }
</style>
