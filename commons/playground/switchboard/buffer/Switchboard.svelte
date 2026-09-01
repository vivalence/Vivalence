<script>
  import { atom } from "@vivalence/typology";

  const { terminal, buffer } = $props();
  const phase = atom.chain(terminal, "$thread", "$phase");
  const active = atom.chain(terminal, "$buffer");
  const isCard = (b) => b.mode?.slug === "card";
  const cards = () => (terminal.thread?.$buffers.get() ?? []).filter(isCard);

  const ORDER = ["inert", "manual", "continuous", "escort"];
  let trace = $state([]);

  function setPhase(key) {
    terminal.stall?.only(isCard);
    terminal.thread.phase = key; // live → the stall re-engages on the SAME buffers
    terminal.thread.daemon.entities.thread.updateOne({ id: terminal.thread.id }, { phase: key });
    trace = [`phase → ${key}`, ...trace].slice(0, 6);
  }
  function cyclePhase() {
    setPhase(ORDER[(ORDER.indexOf(terminal.thread.phase) + 1) % ORDER.length]);
  }
  // switch the render cursor independently of the phase.
  function step(delta) {
    const list = cards();
    if (!list.length) return;
    const at = list.findIndex((b) => b.id === terminal.buffer?.id);
    terminal.buffer = list[(at + delta + list.length) % list.length];
    trace = [`cursor → ${terminal.buffer?.data?.face ?? "?"}`, ...trace].slice(0, 6);
  }
  async function feed() {
    await buffer.mode.emit.feed({ thread: terminal.thread.id });
  }
  const cursorAt = () => cards().findIndex((b) => b.id === active.get?.()?.id) + 1;
</script>

<div class="switchboard">
  <div class="tag">playground · switchboard (thread-driven)</div>
  <div class="readout">
    <span>phase <b>{$phase ?? "—"}</b></span>
    <span>cursor <b>{cursorAt()}/{cards().length}</b></span>
  </div>

  <div class="row">
    <button onclick={feed}>feed</button>
    <button class="cycle" onclick={cyclePhase}>switch phase ⟳</button>
  </div>
  <div class="row">
    {#each ORDER as p (p)}
      <button class:on={$phase === p} onclick={() => setPhase(p)}>{p}</button>
    {/each}
  </div>
  <div class="row">
    <button onclick={() => step(-1)}>‹ prev</button>
    <button onclick={() => step(1)}>next ›</button>
  </div>

  <ul class="trace">
    {#each trace as line, index (index)}<li>{line}</li>{/each}
  </ul>
</div>

<style>
  .switchboard { min-height:100%; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.7rem; padding:18px; background:var(--colors-skeleton-2-surface); color:var(--colors-skeleton-2-contrast); font-family:var(--font-family-code); }
  .tag { font-size:var(--font-size-xs); text-transform:uppercase; letter-spacing:.12em; color:var(--colors-skeleton-0-primary-base); }
  .readout { display:flex; gap:1rem; font-size:var(--font-size-2xs); opacity:.7; } .readout b { color:var(--colors-skeleton-0-primary-base); font-weight:600; }
  .row { display:flex; gap:.5rem; }
  button { padding:.35rem .9rem; font:inherit; font-size:var(--font-size-2xs); color:inherit; background:transparent; border:1px solid color-mix(in srgb,currentColor 25%,transparent); border-radius:.3rem; cursor:pointer; opacity:.8; }
  button:hover { opacity:1; border-color:var(--colors-skeleton-0-primary-base); } button.on, button.cycle { opacity:1; color:var(--colors-skeleton-0-primary-base); border-color:var(--colors-skeleton-0-primary-base); }
  .trace { list-style:none; margin:.3rem 0 0; padding:0; font-size:var(--font-size-2xs); opacity:.5; text-align:center; min-height:5rem; }
</style>
