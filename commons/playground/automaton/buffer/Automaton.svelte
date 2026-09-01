<script>
  import { atom } from "@vivalence/typology";

  const { terminal } = $props();
  const phase = atom.chain(terminal, "$thread", "$phase");
  const traits = atom.chain(terminal, "$thread", "$traits");
  const intent = () => terminal.thread?.intent;
</script>

<div class="automaton">
  <div class="tag">playground · automaton (intent-driven)</div>
  <div class="intent">intent <b>{intent()?.name ?? intent()?.slug ?? "— (no intent)"}</b></div>
  <div class="config">
    <span>phase <b>{$phase ?? "—"}</b></span>
    <span>traits <b>{($traits ?? []).join(" · ") || "none"}</b></span>
  </div>
  <p class="note">
    opened from an intent → the thread inherited this disposition. The stall is managing
    accordingly: continuous/escort intents feed cards into the moat; manual/inert leave it
    to you.
  </p>
</div>

<style>
  .automaton { height:100%; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.7rem; padding:18px; background:var(--colors-skeleton-1-surface); color:var(--colors-skeleton-1-contrast); font-family:var(--font-family-code); text-align:center; }
  .tag { font-size:var(--font-size-xs); text-transform:uppercase; letter-spacing:.12em; color:var(--colors-skeleton-0-primary-base); }
  .intent { font-size:var(--font-size-lg); }
  .intent b, .config b { color:var(--colors-skeleton-0-primary-base); }
  .config { display:flex; gap:1.2rem; font-size:var(--font-size-2xs); opacity:.75; }
  .note { max-width:22rem; font-size:var(--font-size-2xs); line-height:1.5; opacity:.55; }
</style>
