<script>
  import { getContext, untrack } from "svelte";
  import { chain } from "@vivalence/anima";
  import { Empty, Key, Row } from "@vivalence/drapes";
  import { TERMINALS } from "$client";

  const terminals = getContext(TERMINALS);

  const roster = terminals.$entities;
  const active = terminals.$active;

  let version = $state(0);

  $effect(() => {
    const tick = () => untrack(() => (version += 1));
    const teardowns = $roster.flatMap((terminal) => [chain(terminal, "$thread", "$label").subscribe(tick), terminal.$settling.subscribe(tick)]);
    return () => teardowns.forEach((teardown) => teardown());
  });

  const named = (label) => (typeof label === "object" ? label?.name : label) ?? null;

  const project = (terminal) => {
    const thread = terminal.thread;
    return {
      terminal,
      vacant: !thread,
      label: thread ? (named(thread.label) ?? thread.mode?.slug ?? thread.id.slice(0, 8)) : terminal.settling ? "settling" : "no thread",
      meta: [thread && `${thread.daemon?.slug ?? "—"}/${thread.mode?.slug ?? "—"}`, terminal.id.slice(0, 6)].filter(Boolean).join(" · "),
    };
  };

  const rows = $derived.by(() => {
    void version;
    return $roster.map(project);
  });

  function close(event, terminal) {
    event.stopPropagation();
    terminals.remove(terminal.id);
  }
</script>

<div class="terminals">
  {#each rows as row (row.terminal.id)}
    <Row selected={$active?.id === row.terminal.id} title="activate this terminal" onclick={() => terminals.activate(row.terminal.id)}>
      <span class="terminal-label" class:vacant={row.vacant}>{row.label}</span>
      <span class="terminal-meta">{row.meta}</span>
      <Key tone="ghost" size="mini" square label="✕" title="close terminal" onclick={(event) => close(event, row.terminal)} />
    </Row>
  {:else}
    <div class="vacancy">
      <Empty verb="no terminals" trace="a terminal holds one thread and its cursor" />
      <Key tone="primary" label="+ terminal" onclick={() => terminals.create()} />
    </div>
  {/each}
</div>

<style>
  .terminals {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .terminal-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-strong);
  }
  .terminal-label.vacant {
    font-style: italic;
    color: var(--text-light);
  }
  .terminal-meta {
    flex: none;
    max-width: 50%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-muted);
  }
  .vacancy {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 18px 8px calc(12px + var(--size-depth));
  }
</style>
