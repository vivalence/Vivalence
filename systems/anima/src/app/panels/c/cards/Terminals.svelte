<script>
  import { getContext, untrack } from "svelte";
  import { chain } from "@vivalence/anima";
  import { Key } from "@vivalence/drapes";
  import { TERMINALS } from "$client";
  import { logger } from "$telemetry";
  import Card from "./Card.svelte";
  import Row from "./Row.svelte";

  let { ...chrome } = $props();

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
    const thread = terminal.$thread.get();
    return {
      terminal,
      vacant: !thread,
      name: thread ? (named(thread.label) ?? thread.mode?.slug ?? thread.id.slice(0, 8)) : terminal.settling ? "settling" : "no thread",
      id: terminal.id.slice(0, 6),
    };
  };

  const rows = $derived.by(() => {
    void version;
    return $roster.map(project);
  });

  const spawn = () => terminals.create().catch((error) => logger.entry("terminals/create").fault(error));

  function close(event, terminal) {
    event.stopPropagation();
    terminals.remove(terminal.id);
  }
</script>

<Card label="terminals" {...chrome}>
  {#snippet action()}
    <button class="card-key head" title="open a terminal" onclick={spawn}>+ terminal</button>
  {/snippet}
  <div class="terminals card-list">
    {#each rows as row (row.terminal.id)}
      <Row selected={$active?.id === row.terminal.id} title="activate this terminal" onclick={() => terminals.activate(row.terminal.id)}>
        <span class="terminal-name" class:vacant={row.vacant}>{row.name}</span>
        <span class="card-dim">{row.id}</span>
        <Key tone="ghost" size="mini" square label="✕" title="close terminal" onclick={(event) => close(event, row.terminal)} />
      </Row>
    {:else}
      <div class="terminals-empty">
        <span class="card-dim">no terminals</span>
        <button class="card-key" title="open a terminal" onclick={spawn}>+ terminal</button>
      </div>
    {/each}
  </div>
</Card>

<style>
  .terminals {
    padding: 6px;
  }
  .terminal-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: inherit;
  }
  .terminal-name.vacant {
    font-style: italic;
    color: var(--control-on-muted);
  }
  .terminals-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 32px 8px;
  }
</style>
