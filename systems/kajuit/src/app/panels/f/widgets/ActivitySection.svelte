<script>
  // the roster at the top of F. the daemon DELETES an activity the moment it settles, so a
  // settled row is kept here for a breath with its outcome, then let go — rule 1. the roster
  // is this thread's; every other thread folds behind one line.
  import { Section } from "@vivalence/drapes";
  import ActivityRow from "./ActivityRow.svelte";
  import { untrack } from "svelte";

  let { thread, density = "line" } = $props();

  const LINGER = 6000;

  let live = $state([]);
  let version = $state(0);
  let lingering = $state([]);
  let shown = $state(true);
  let otherOpen = $state(false);

  // an EXPANDED row is being read: it never decays under the reader. it leaves when collapsed,
  // if its linger already ran out.
  const pinned = new Set();
  const overdue = new Set();
  const evict = (id) => (lingering = lingering.filter((held) => held.id !== id));
  function onopen(row, open) {
    if (open) return void pinned.add(row.id);
    pinned.delete(row.id);
    if (overdue.has(row.id)) {
      overdue.delete(row.id);
      evict(row.id);
    }
  }

  const repository = $derived(thread?.daemon?.entities?.activity ?? null);

  // one subscription per daemon. a row that leaves the store is snapshotted, not forgotten:
  // its last update carried the outcome, and that is the only place the outcome ever exists.
  $effect(() => {
    if (!repository) return;
    const timers = new Map();
    let seen = new Map();
    const off = repository.$entities.subscribe((held) => untrack(() => {
      const now = new Map(held.map((row) => [row.id, row]));
      for (const [id, row] of seen) {
        if (now.has(id) || timers.has(id)) continue;
        const parting = { ...row.toJSON(), status: row.status, error: row.error, steps: row.steps, thread: row.thread };
        lingering = [...lingering, parting];
        timers.set(id, setTimeout(() => {
          timers.delete(id);
          if (pinned.has(id)) overdue.add(id);
          else evict(id);
        }, LINGER));
      }
      seen = now;
      live = held;
      version += 1;
    }));
    return () => {
      off();
      for (const timer of timers.values()) clearTimeout(timer);
    };
  });

  const id = (ref) => (ref && typeof ref === "object" ? ref.id : ref) ?? null;
  const mine = (row) => !thread || id(row.thread) === thread.id;

  const rows = $derived([...live.filter(mine), ...lingering.filter(mine)]);
  const others = $derived(live.filter((row) => !mine(row)));

  const SAID = { SIGSTOP: "pause", SIGCONT: "resume", SIGTERM: "stop", SIGKILL: "kill" };
  async function onsignal(row, name) {
    await row.stdin?.[name]?.(`user pressed ${SAID[name]}`);
  }
</script>

<section class="activity">
  <Section label="activity" count={rows.length}>
    {#snippet action()}
      <button class="mini" onclick={() => (shown = !shown)}>{shown ? "hide" : "show"}</button>
    {/snippet}
  </Section>

  {#if shown}
    <div class="roster">
      {#each rows as row (row.id)}
        <ActivityRow {row} {version} {density} {onsignal} {onopen} />
      {/each}

      {#if !rows.length}
        <div class="empty">no activity</div>
      {/if}

      {#if others.length}
        <button class="fold" onclick={() => (otherOpen = !otherOpen)}>
          <span>{otherOpen ? "▾" : "▸"}</span>
          <span class="fold-label">other threads</span>
          <span>{others.length}</span>
        </button>
        {#if otherOpen}
          {#each others as row (row.id)}
            <ActivityRow {row} {version} density="line" {onsignal} />
          {/each}
        {/if}
      {/if}
    </div>
  {/if}
</section>

<style>
  .activity {
    min-width: 0;
    max-width: 100%;
  }
  .roster {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
  }
  .empty {
    padding: 4px 2px;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.5;
  }
  .fold {
    display: flex;
    align-items: center;
    gap: 7px;
    width: 100%;
    padding: 4px 2px 3px;
    background: none;
    border: none;
    color: var(--colors-skeleton-0-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    text-align: left;
    opacity: 0.45;
    cursor: pointer;
  }
  .fold-label { flex: 1; }
  .mini {
    background: none;
    border: none;
    color: var(--colors-skeleton-0-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    opacity: 0.45;
    cursor: pointer;
  }
</style>
