<script>
  import { getContext } from "svelte";
  import { chain } from "@vivalence/anima";
  import { Empty, Row, Section } from "@vivalence/drapes";
  import { TERMINALS } from "$client";
  import { callRoster, clockTime, contextSize, enrich, exchanges, manifest, sessionUsage, tokens, turnCensus, turnUsage } from "../../a/widgets/turns.js";

  const terminals = getContext(TERMINALS);

  const thread = chain(terminals, "$active", "$thread");
  const mode = chain(terminals, "$active", "$thread", "$mode");
  const label = chain(terminals, "$active", "$thread", "$label");
  const turns = chain(terminals, "$active", "$thread", "$turns");

  const harnessed = $derived($mode?.implements?.("HARNESSED") ?? false);
  const items = $derived(enrich($turns ?? []));
  const calls = $derived(exchanges(items));
  const tools = $derived(calls.flatMap((item) => item.tools));
  const seen = $derived(callRoster(calls).map((name) => ({ name, uses: tools.filter((tool) => tool.name === name), failed: tools.some((tool) => tool.name === name && tool.status === "error") })));
  const lines = $derived(manifest(items, $label?.name ?? "agent"));
  const spend = $derived(sessionUsage($turns ?? []));
  const context = $derived(contextSize($turns ?? []));

  const spent = (turn) => {
    const usage = turnUsage(turn);
    return usage ? `${tokens(usage.input)} → ${tokens(usage.output)}` : "";
  };

  const meter = $derived([
    ["turns", lines.length],
    ["calls", tools.length],
    ["tools", seen.length],
    ...turnCensus(tools).map((entry) => [entry.type, entry.count]),
    ...(spend.seen ? [["tokens in", tokens(spend.input)], ["tokens out", tokens(spend.output)]] : []),
    ...(spend.seen && context !== null ? [["context", tokens(context)]] : []),
  ]);
</script>

{#if !$thread}
  <Empty verb="no thread" trace="the harness pane follows the active thread" />
{:else if !harnessed}
  <Empty verb="mode is not harnessed" trace="no chat, no activity" />
{:else}
  <div class="harness">
    <div class="harness-part">
      <Section label="session calls" count="{tools.length} · {calls.length} turns" />
      <div class="harness-list">
        {#each calls as item (item.turn.id)}
          <div class="harness-line">
            <span class="harness-mark">◆</span>
            <span class="harness-time">{clockTime(item.date)}</span>
            <span class="harness-calls">{item.tools.map((tool) => tool.name).join(" · ") || "no calls"}</span>
            <span class="harness-usage">{spent(item.turn)}</span>
          </div>
        {:else}
          <span class="harness-note">no calls yet</span>
        {/each}
      </div>
    </div>

    <div class="harness-part">
      <Section label="turn manifest" count="{lines.length} turns" />
      <div class="harness-list">
        {#each lines as line (line.id)}
          <div class="harness-line">
            <span class="harness-time">{line.who} · {line.time}</span>
            <span class="harness-calls">{line.parts}</span>
          </div>
        {:else}
          <span class="harness-note">no turn yet</span>
        {/each}
      </div>
    </div>

    <div class="harness-part">
      <Section label="meter" count={$mode?.slug ?? null} />
      <div class="harness-tiles">
        {#each meter as [name, value], index (index)}
          <div class="harness-tile">
            <span class="harness-tile-name">{name}</span>
            <span class="harness-tile-value">{value}</span>
          </div>
        {/each}
      </div>
      {#if !spend.seen}<span class="harness-note">no usage on the wire</span>{/if}
    </div>

    <div class="harness-part">
      <Section label="tools seen" count={seen.length} />
      <div class="harness-list">
        {#each seen as tool (tool.name)}
          <Row>
            <span class="harness-tool" class:failed={tool.failed}>{tool.name}</span>
            <span class="harness-uses">×{tool.uses.length}</span>
          </Row>
        {:else}
          <span class="harness-note">none seen on this thread</span>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .harness {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px 12px;
    min-width: 0;
    padding: 6px 4px 4px;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
  }
  .harness-part {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  .harness-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .harness-line {
    display: flex;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
  }
  .harness-mark {
    flex: none;
    color: var(--signal-primary-ink);
  }
  .harness-time {
    flex: none;
    color: var(--text-light);
    font-variant-numeric: tabular-nums;
  }
  .harness-calls {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-ink);
  }
  .harness-usage {
    flex: none;
    color: var(--text-light);
    font-variant-numeric: tabular-nums;
  }
  .harness-note {
    color: var(--text-light);
  }
  .harness-tiles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
    gap: 6px;
  }
  .harness-tile {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    padding: 7px 8px 8px;
    border-radius: var(--shape-radius-key);
    background: var(--surface-sunk);
    box-shadow: inset 0 0 0 var(--size-ring) var(--boundary);
  }
  .harness-tile-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    color: var(--text-light);
  }
  .harness-tile-value {
    font-size: var(--size-type-sm);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--signal-primary-ink);
  }
  .harness-tool {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-strong);
  }
  .harness-tool.failed {
    color: var(--signal-negative-ink);
  }
  .harness-uses {
    flex: none;
    color: var(--text-light);
    font-variant-numeric: tabular-nums;
  }
</style>
