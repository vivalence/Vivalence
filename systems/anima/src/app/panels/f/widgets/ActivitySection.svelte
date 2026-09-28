<script>
  // the roster. the daemon DELETES an activity the moment it settles, so a
  // settled row is kept here for a breath with its outcome, then let go — rule 1. the roster
  // is this thread's; every other thread folds behind one line.
  import { owed } from "@vivalence/anima";
  import { Empty, Key, Row, Section } from "@vivalence/drapes";
  import ActivityRow from "./ActivityRow.svelte";
  import { settled } from "./activity.js";
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
  const running = $derived.by(() => {
    void version;
    return live.filter(mine).filter((row) => !settled(row.status));
  });

  const SAID = { SIGSTOP: "pause", SIGCONT: "resume", SIGTERM: "stop", SIGKILL: "kill" };
  async function onsignal(row, name) {
    await row.stdin?.[name]?.(`user pressed ${SAID[name]}`);
  }

  const sent = new Set();
  function stopAll(event) {
    event.stopPropagation();
    for (const row of owed("SIGTERM", running, sent)) onsignal(row, "SIGTERM");
  }
</script>

<div class="roster">
  <Section label="activity" count="{running.length} live" open={shown} ontoggle={() => (shown = !shown)}>
    {#snippet action()}
      <Key tone="ghost" size="mini" label="stop all" disabled={!running.length} title="SIGTERM to every live activity of this thread" onclick={stopAll} />
    {/snippet}
  </Section>

  {#if shown}
    <div class="roster-rows">
      {#each rows as row (row.id)}
        <ActivityRow {row} {version} {density} {onsignal} {onopen} />
      {/each}

      {#if !rows.length}
        <Empty verb="no activity" />
      {/if}

      {#if others.length}
        <Row title="the activities of every other thread" onclick={() => (otherOpen = !otherOpen)}>
          <span class="roster-caret">{otherOpen ? "▾" : "▸"}</span>
          <span class="roster-fold">other threads</span>
          <span class="roster-count">{others.length}</span>
        </Row>
        {#if otherOpen}
          {#each others as row (row.id)}
            <ActivityRow {row} {version} density="line" {onsignal} />
          {/each}
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style>
  .roster {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    max-width: 100%;
  }
  .roster-rows {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
  }
  .roster-caret {
    flex: none;
    width: 8px;
    color: var(--text-light);
  }
  .roster-fold {
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    color: var(--text-light);
  }
  .roster-count {
    color: var(--text-light);
    font-variant-numeric: tabular-nums;
  }
</style>
