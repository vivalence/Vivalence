<script>
  import "@vivalence/dapper/font.css";
  import "../client.css";
  import { setContext } from "svelte";
  import { onMount } from "svelte";
  import { computed } from "nanostores";
  import { Connection, Url } from "@vivalence/typology";
  import { env } from "$env/dynamic/public";
  import { LIGHTHOUSE, QUARTERS, BRIDGE, TOP, BOX } from "$client";
  import {
    lighthouse as lighthouseDeck,
    quarters as quartersDeck,
    bridge as bridgeDeck,
    top as topDeck,
    box as boxDeck,
    traits,
  } from "@vivalence/kajuit";
  import Login from "@vivalence/kajuit/skins/lighthouse/Login.svelte";

  let { children } = $props();
  let gate = $state("boot");
  let terminalCount = $state(0);

  const lighthouse = new lighthouseDeck.Lighthouse(
    new Connection(new Url(env.PUBLIC_VIVA_LIGHTHOUSE_REMOTE)),
  );
  lighthouseDeck.hydrate(lighthouse);
  setContext(LIGHTHOUSE, lighthouse);

  const quarters = new quartersDeck.Quarters();
  setContext(QUARTERS, quarters);

  const bridge = new bridgeDeck.Bridge();
  setContext(BRIDGE, bridge);

  const top = new topDeck.Top(quarters, lighthouse);
  setContext(TOP, top);

  const box = new boxDeck.Box();
  setContext(BOX, box);

  traits.thread.conversational.provide({ box, top });

  if (typeof window !== "undefined") {
    window.__viv = { lighthouse, quarters, bridge, top, box };
  }

  onMount(() => {
    lighthouseDeck.boot(lighthouse).catch(console.error);

    const unsubscribeGate = computed(
      [lighthouse.$isAuthorized, lighthouse.$status],
      (authorized, status) => {
        if (status.code === "OFFLINE") return "offline";
        if (status.code === "ERROR" || status.code === "SESSION_EXPIRED") return "error";
        if (!authorized) return "auth";
        if (["AUTHENTICATING", "VERIFYING", "REFRESHING"].includes(status.code)) return "verifying";
        return "ready";
      },
    ).subscribe((value) => (gate = value));

    const unsubscribePopulate = lighthouse.$isAuthorized.subscribe((authorized) => {
      if (authorized) lighthouseDeck.populate(lighthouse).catch(console.error);
    });

    const unsubscribeTerminals = quarters.terminals.$entities.subscribe((entities) => {
      terminalCount = entities.length;
    });

    return () => {
      unsubscribeGate();
      unsubscribePopulate();
      unsubscribeTerminals();
    };
  });

  async function onLogin() {
    await lighthouseDeck.boot(lighthouse);
  }
</script>

{#if gate === "ready"}
  {@render children()}
  {#if terminalCount === 0}
    <div class="empty-overlay" onclick={() => top.spawn()} role="presentation">
      <span class="empty-prompt">open terminal</span>
    </div>
  {/if}
{:else if gate === "auth"}
  <div class="gate">
    <Login {lighthouse} onConnected={onLogin} />
  </div>
{:else if gate === "error"}
  <div class="gate">
    <div class="gate-message">
      <span class="gate-status">error</span>
      <span class="gate-detail">{lighthouse.status.message ?? "connection failed"}</span>
      <button
        class="gate-action"
        onclick={() => lighthouseDeck.boot(lighthouse).catch(() => {})}>retry</button>
    </div>
  </div>
{:else if gate === "offline"}
  <div class="gate">
    <div class="gate-message">
      <span class="gate-status">offline</span>
      <span class="gate-detail">network unavailable</span>
      <button
        class="gate-action"
        onclick={() => lighthouseDeck.boot(lighthouse).catch(() => {})}>reconnect</button>
    </div>
  </div>
{:else}
  <div class="gate">{gate}</div>
{/if}

<style>
  .gate {
    display: grid;
    place-items: center;
    height: 100svh;
    background: var(--colors-skeleton-0-surface);
    color: var(--colors-skeleton-0-contrast);
    font-family: var(--font-family-code);
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: lowercase;
  }
  .gate-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .gate-status {
    font-size: 11px;
    font-weight: 600;
    color: var(--colors-skeleton-0-danger-base);
  }
  .gate-detail {
    color: var(--colors-skeleton-2-contrast);
  }
  .gate-action {
    background: none;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 4px;
    color: var(--colors-skeleton-0-contrast);
    font-family: var(--font-family-code);
    font-size: 9px;
    letter-spacing: 0.08em;
    padding: 4px 12px;
    cursor: pointer;
    transition: all 0.12s;
  }
  .gate-action:hover {
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-skeleton-1-contrast);
  }
  .empty-overlay {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: grid;
    place-items: center;
    backdrop-filter: blur(12px);
    background: color-mix(in srgb, var(--colors-skeleton-0-surface) 70%, transparent);
    cursor: pointer;
  }
  .empty-prompt {
    font-family: var(--font-family-code);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: lowercase;
    color: var(--colors-skeleton-0-contrast);
    opacity: 0.6;
    padding: 8px 16px;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 4px;
    transition: opacity 0.12s;
  }
  .empty-overlay:hover .empty-prompt {
    opacity: 1;
  }
</style>
