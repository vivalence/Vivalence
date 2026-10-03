<script>
  import { getContext } from "svelte";
  import { nearest } from "@vivalence/typology";
  import { chain } from "@vivalence/anima";
  import { TERMINALS } from "$client";
  import { logger } from "$telemetry";
  import { EFFORTS, TIERS, faculties, write } from "../../../widgets/intelligent.js";
  import Faculty from "../../../widgets/Faculty.svelte";
  import { contextSize, enrich, exchanges, sessionUsage, tokens } from "../../a/widgets/turns.js";
  import Card from "./Card.svelte";

  const ROUNDS = { min: 1, max: 50, first: 10 };
  const KNOBS = [
    ["tune", TIERS.map((tier) => [tier, tier])],
    ["effort", EFFORTS.map((effort) => [effort, effort])],
    ["thinking", [[true, "shown"], [false, "hidden"]]],
  ];

  let { ...chrome } = $props();

  const terminals = getContext(TERMINALS);

  const thread = chain(terminals, "$active", "$thread");
  const mode = chain(terminals, "$active", "$thread", "$mode");
  const label = chain(terminals, "$active", "$thread", "$label");
  const turns = chain(terminals, "$active", "$thread", "$turns");
  const trait = chain(terminals, "$active", "$thread", "$trait");

  const harnessed = $derived($mode?.implements?.("HARNESSED") ?? false);
  const items = $derived(enrich($turns ?? []));
  const calls = $derived(exchanges(items).flatMap((item) => item.tools));
  const spend = $derived(sessionUsage($turns ?? []));
  const context = $derived(contextSize($turns ?? []));
  const meter = $derived([
    ["input", tokens(spend.input)],
    ["output", tokens(spend.output)],
    ["context", context === null ? "—" : tokens(context)],
    ["calls", String(calls.length)],
  ]);
  const held = $derived($trait?.INTELLIGENT ?? {});
  const rounds = $derived(held.rounds);
  const pool = $derived(faculties($thread));
  const resolved = $derived(pool.length && held.tune != null ? nearest(pool, held.tune) : null);

  let saving = $state(false);
  async function put(patch) {
    const current = $thread;
    if (!current || saving) return;
    saving = true;
    try {
      await write(current, patch);
    } catch (error) {
      logger.entry(`intelligent/${current.id}`).fault(error);
    } finally {
      saving = false;
    }
  }

  const toggle = (key, value) => put({ [key]: held[key] === value ? undefined : value });
  const bound = (count) => Math.max(ROUNDS.min, Math.min(ROUNDS.max, Math.round(count)));
  const inc = (event) => put({ rounds: rounds === undefined ? ROUNDS.first : bound(event.shiftKey ? rounds * 2 : rounds + 1) });
  const dec = (event) => put({ rounds: rounds === undefined ? ROUNDS.first : bound(event.shiftKey ? rounds / 2 : rounds - 1) });
  const clear = () => put({ rounds: undefined });
</script>

<Card label="harness" meta={$thread ? ($label?.name ?? null) : null} {...chrome}>
  {#if !$thread}
    <div class="card-stack"><span class="card-dim">no thread</span></div>
  {:else if !harnessed}
    <div class="card-stack"><span class="card-dim">mode is not harnessed</span></div>
  {:else}
    <div class="card-stack">
      <div class="harness-meter">
        {#each meter as [name, value] (name)}
          <div class="harness-tile">
            <span class="card-dim">{name}</span>
            <span class="harness-value">{value}</span>
          </div>
        {/each}
      </div>

      <div class="harness-knobs">
        <span class="card-name">intelligent</span>
        {#each KNOBS as [key, options] (key)}
          <div class="harness-knob">
            <span class="card-dim">{key}</span>
            <div class="harness-options">
              {#each options as [value, name] (name)}
                <button class="card-key option" class:pressed={held[key] === value} disabled={saving} title="{key} {name}" onclick={() => toggle(key, value)}>{name}</button>
              {/each}
            </div>
          </div>
        {/each}
        <div class="harness-knob">
          <span class="card-dim">rounds</span>
          <div class="harness-rounds">
            <button class="card-key square" title="−1 · shift halves" disabled={saving} onclick={dec}>−</button>
            <button class="card-key option harness-count" class:pressed={rounds !== undefined} title="click to clear" disabled={saving} onclick={clear}>{rounds ?? "—"}</button>
            <button class="card-key square" title="+1 · shift doubles" disabled={saving} onclick={inc}>+</button>
          </div>
        </div>
        <div class="harness-faculty">
          <Faculty {resolved} effort={held.effort} />
        </div>
      </div>
    </div>
  {/if}
</Card>

<style>
  .harness-meter {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
    gap: 8px;
  }
  .harness-tile {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    padding: 10px;
    border-radius: var(--shape-radius-card);
    background: var(--control-field);
    box-shadow: var(--shape-sunk);
  }
  .harness-value {
    font-family: var(--font-family-sans-heading);
    font-size: 20px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--text-header);
  }
  .harness-knobs {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .harness-knob {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr);
    gap: 4px 10px;
    align-items: center;
  }
  .harness-options {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .harness-rounds {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .harness-count {
    min-width: 34px;
    padding: 0 6px;
  }
  .harness-count:not(.pressed) {
    background: var(--control-field);
    color: var(--text-light);
  }
  .harness-faculty {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-left: 62px;
  }
</style>
