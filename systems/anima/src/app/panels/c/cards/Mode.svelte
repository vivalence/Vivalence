<script>
  import { getContext } from "svelte";
  import { ModeTraits, chain, stores } from "@vivalence/anima";
  import { BRIDGE, TERMINALS } from "$client";
  import { logger } from "$telemetry";
  import Card from "./Card.svelte";
  import { mint } from "./threads.js";

  const WORDS = {
    APPLICATION: "compiles a view · the frame mounts its bundle",
    EMITTER: "branches the mount pulls from",
    EXPOSED: "aperture · mode.call proxies its routes",
    HARNESSED: "dialogue · object · choice · verbatim over render/stream",
    GENERATIVE: "draws a view per buffer · beats the application's",
    STANDALONE: "opens a buffer without an aim",
    CONVERSATIONAL: "listed for chat",
    TOOLING: "tools on the harness",
  };

  let { ...chrome } = $props();

  const bridge = getContext(BRIDGE);
  const terminals = getContext(TERMINALS);

  const thread = chain(terminals, "$active", "$thread");
  const mode = chain(terminals, "$active", "$thread", "$mode");

  const initials = $derived(($mode?.name ?? $mode?.slug ?? "—").slice(0, 2).toUpperCase());

  let busy = $state(false);
  async function spawn() {
    const current = $thread;
    const held = $mode;
    if (!current || !held || busy) return;
    busy = true;
    try {
      const terminal = await mint(terminals, current.daemon, held);
      if (held.implements("STANDALONE")) await ModeTraits.standalone.open(terminal, held);
    } catch (error) {
      logger.entry(`threads/${current.daemon?.slug}/${held.slug}`).fault(error);
    } finally {
      busy = false;
    }
  }

  function replace() {
    const next = stores.bridge.panes.reveal({ tree: bridge.panels.c.tree }, "modes", stores.bridge.railGrain(bridge));
    bridge.panels.c.tree = next.tree;
    bridge.panels.c.expanded = next.expanded;
    bridge.save();
  }
</script>

<Card label="mode" meta={$mode?.type ?? null} {...chrome}>
  {#if !$thread}
    <div class="card-stack"><span class="card-dim">no thread · mode follows the active thread</span></div>
  {:else}
    <div class="card-stack">
      <div class="card-group">
        <div class="mode-row">
          <span class="mode-mark">{initials}</span>
          <div class="mode-text">
            <span class="mode-name">{$mode?.name ?? $mode?.slug ?? "—"}</span>
            <span class="card-dim">{$mode?.type ?? ""}</span>
          </div>
        </div>
        <div class="card-keys">
          {#each $mode?.traits ?? [] as trait (trait)}<span class="card-pill" title={WORDS[trait] ?? "marker"}>{trait.toLowerCase()}</span>{/each}
        </div>
      </div>
      <div class="card-keys">
        <button class="card-key" disabled={busy} title="a fresh thread on this mode, seated here" onclick={spawn}>{busy ? "…" : "new thread"}</button>
        <button class="card-key" title="pick another mode · re-modes this thread" onclick={replace}>replace</button>
      </div>
    </div>
  {/if}
</Card>

<style>
  .mode-row {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .mode-mark {
    flex: none;
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border-radius: var(--shape-radius-key);
    background: var(--control-field);
    color: var(--text-strong);
    font-size: 12px;
    font-weight: 600;
  }
  .mode-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .mode-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
    color: var(--text-strong);
  }
</style>
