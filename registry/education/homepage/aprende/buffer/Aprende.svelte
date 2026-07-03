<script>
  import { Section } from "@vivalence/drapes";
  import Helpdesk from "./Helpdesk.svelte";
  import Roster from "./Roster.svelte";
  import Actions from "./Actions.svelte";
  import Memory from "./Memory.svelte";
  import Activity from "./Activity.svelte";
  import Ranks from "./Ranks.svelte";

  const { terminal, buffer } = $props();

  // ── help desk · tutor ──
  async function askTutor(text) {
    const result = await buffer.mode.call("/assistant/message", {
      prompt: text,
      thread: terminal.thread.id,
    });
    // some ways to solve this now:
    // either the aperture returns render instructions,
    // or we set a reaction on buffer dataspace
    // or we set render modes on either client or server and have the terminal react.
    // or we have the render contain other yields aka buffer entities.
    return result.answer;
  }

  // ── ONE optimized read · the whole board ─────────────────────────────
  // every stat panel derives from `board` — bar, scatter, and ranks can never disagree
  // because there is exactly one source. streak rides statistics (it folds trace-days).
  // the mode owns a connection scoped to its aperture mount, so the EXPOSED nature is
  // called bare — no hand-assembled daemon path.
  let board = $state([]);
  let streak = $state(0);

  buffer.mode
    .call("/assistant/wakeup/board", {})
    .then((rows) => (board = rows ?? []))
    .catch((error) => console.warn("[aprende] board failed", error));

  buffer.mode
    .call("/assistant/wakeup/statistics", {})
    .then((stats) => (streak = stats.activity.streak))
    .catch((error) => console.warn("[aprende] statistics failed", error));
</script>

<div class="aprende">
  <!-- ── help desk · tutor + the games in play ── -->
  <section class="desk">
    <Section label="Help desk" action={deskHint} />
    {#snippet deskHint()}<span class="desk-hint">click to chat with your tutor</span>{/snippet}
    <Helpdesk onsend={askTutor} />
    <Roster {terminal} current={buffer} />
  </section>

  <!-- ── actions ── -->
  <Actions {terminal} {buffer} />

  <!-- ── stats · memory + ranks (left) · scatter (right) ── -->
  <div class="stats-row">
    <div class="cell cell-memory"><Memory {board} /></div>
    <div class="cell cell-scatter"><Activity {board} {streak} /></div>
    <div class="cell cell-ranks"><Ranks {board} /></div>
  </div>
</div>

<style>
  .aprende {
    container-type: inline-size;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    height: 100%;
    padding: 1.4rem 1.6rem;
    overflow-x: hidden;
    overflow-y: auto;
  }

  /* ── help desk ── */
  .desk {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
  .desk-hint {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-boundary);
  }

  /* ── stats · boxless 40 / 60 ── */
  .stats-row {
    display: grid;
    grid-template-columns: 2fr 3fr;
    grid-template-rows: auto 1fr;
    grid-template-areas: "memory scatter" "ranks scatter";
    gap: 1.5rem 2.25rem;
  }
  .cell {
    min-width: 0;
  }
  .cell-memory {
    grid-area: memory;
  }
  .cell-ranks {
    grid-area: ranks;
  }
  .cell-scatter {
    grid-area: scatter;
  }
  @container (max-width: 780px) {
    .stats-row {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
      grid-template-areas: "memory" "scatter" "ranks";
    }
  }
</style>
