<script>
  import { getContext } from "svelte";
  import { ModeTraits, chain } from "@vivalence/anima";
  import { LIGHTHOUSE, TERMINALS } from "$client";
  import { logger } from "$telemetry";
  import Card from "./Card.svelte";
  import Row from "./Row.svelte";
  import { healthy, pickDaemon, pickMode } from "./threads.js";

  const WAYS = ["APPLICATION", "HARNESSED"];

  let { ...chrome } = $props();

  const lighthouse = getContext(LIGHTHOUSE);
  const terminals = getContext(TERMINALS);

  const daemons = lighthouse.$daemons;
  const active = chain(terminals, "$active", "$thread");

  let chosen = $state(null);

  const held = $derived(healthy($daemons));
  const daemon = $derived(pickDaemon(held, chosen, $active));
  const several = $derived(held.length > 1);

  const cycle = () => {
    if (!several) return;
    chosen = held[(held.indexOf(daemon) + 1) % held.length].slug;
  };

  const modes = $derived.by(() => {
    void $daemons;
    if (!daemon) return [];
    return Object.values(daemon.modes)
      .flatMap((group) => Object.values(group))
      .filter((mode) => WAYS.some((way) => mode.implements(way)));
  });

  async function pick(mode) {
    try {
      const terminal = await pickMode(terminals, daemon, mode);
      if (terminal && mode.implements("STANDALONE")) await ModeTraits.standalone.open(terminal, mode);
    } catch (error) {
      logger.entry(`threads/${daemon.slug}/${mode.slug}`).fault(error);
    }
  }
</script>

<Card label="modes" meta={several ? null : (daemon?.slug ?? "no daemon")} {...chrome}>
  {#snippet action()}
    {#if several}
      <button class="modes-pick" title="next daemon · {held.length} healthy" onclick={cycle}>{daemon.slug} ⟳</button>
    {/if}
  {/snippet}
  <div class="modes card-list">
    {#each modes as mode (mode.id)}
      <Row title="a thread on this mode" onclick={() => pick(mode)}>
        <span class="modes-label"><span class="modes-dot" class:down={!mode.status?.is?.("healthy")}></span>{mode.name ?? mode.slug}</span>
        <span class="card-dim">{mode.type}</span>
      </Row>
    {:else}
      <span class="modes-empty card-dim">{daemon ? "no modes" : "modes arrive on mount"}</span>
    {/each}
  </div>
</Card>

<style>
  .modes {
    padding: 6px;
  }
  .modes-label {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: inherit;
  }
  .modes-dot {
    flex: none;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: var(--signal-positive);
  }
  .modes-dot.down {
    background: var(--signal-caution);
  }
  .modes-empty {
    padding: 0 8px;
  }
  .modes-pick {
    border: none;
    padding: 0;
    background: none;
    font: inherit;
    font-weight: 400;
    letter-spacing: 0;
    text-transform: none;
    color: var(--text-light);
    cursor: pointer;
  }
</style>
