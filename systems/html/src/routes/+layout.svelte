<script>
  import "@vivalence/dapper/font.css";
  import "../client.css";
  import { setContext } from "svelte";
  import { onMount } from "svelte";
  import { computed } from "nanostores";
  import { Connection, Url } from "@vivalence/typology";
  import { env } from "$env/dynamic/public";
  import { LIGHTHOUSE, QUARTERS, BRIDGE, THREAD } from "$client";
  import { lighthouse, quarters, bridge, thread } from "@vivalence/html";
  import Login from "@vivalence/html/skins/lighthouse/Login.svelte";

  let { children } = $props();
  let gate = $state("boot");
  let terminalCount = $state(0);

  const lighthouseConnection = new Connection(new Url(env.PUBLIC_VIVA_LIGHTHOUSE_REMOTE));
  const lighthouseInstance = new lighthouse.Lighthouse(lighthouseConnection);
  lighthouse.hydrate(lighthouseInstance);
  setContext(LIGHTHOUSE, lighthouseInstance);

  const quartersInstance = new quarters.Quarters();
  setContext(QUARTERS, quartersInstance);

  const bridgeInstance = new bridge.Bridge();
  setContext(BRIDGE, bridgeInstance);

  const threadInstance = new thread.ThreadContext(quartersInstance, lighthouseInstance);
  setContext(THREAD, threadInstance);

  if (typeof window !== "undefined") {
    window.__viv = {
      lighthouse: lighthouseInstance,
      quarters: quartersInstance,
      bridge: bridgeInstance,
      thread: threadInstance,
    };
  }

  const gateComputed = computed(
    [lighthouseInstance.$isAuthorized, lighthouseInstance.$status],
    (authorized, status) => {
      if (status.code === "OFFLINE") return "offline";
      if (status.code === "ERROR" || status.code === "SESSION_EXPIRED") return "error";
      if (!authorized) return "auth";
      if (
        status.code === "AUTHENTICATING" ||
        status.code === "VERIFYING" ||
        status.code === "REFRESHING"
      )
        return "verifying";
      return "ready";
    },
  );

  let populated = false;

  onMount(() => {
    lighthouse.boot(lighthouseInstance).catch(() => {});

    const unsubscribeGate = gateComputed.subscribe((value) => {
      gate = value;
    });

    const unsubscribePopulate = lighthouseInstance.$isAuthorized.subscribe((authorized) => {
      if (authorized && !populated) {
        populated = true;
        lighthouse.populate(lighthouseInstance).catch(() => {});
      }
    });

    const unsubscribeTerminals = quartersInstance.terminals.$entities.subscribe((entities) => {
      terminalCount = entities.length;
    });

    return () => {
      unsubscribeGate();
      unsubscribePopulate();
      unsubscribeTerminals();
    };
  });

  async function onLogin() {
    await lighthouse.boot(lighthouseInstance);
  }
</script>

{#if gate === "ready"}
  {@render children()}
  {#if terminalCount === 0}
    <div class="empty-overlay" onclick={() => quartersInstance.spawn()} role="presentation">
      <span class="empty-prompt">open terminal</span>
    </div>
  {/if}
{:else if gate === "auth"}
  <div class="gate">
    <Login lighthouse={lighthouseInstance} onConnected={onLogin} />
  </div>
{:else if gate === "error"}
  <div class="gate">
    <div class="gate-message">
      <span class="gate-status">error</span>
      <span class="gate-detail"
        >{lighthouseInstance.$status.get().message ?? "connection failed"}</span>
      <button
        class="gate-action"
        onclick={() => lighthouse.boot(lighthouseInstance).catch(() => {})}>retry</button>
    </div>
  </div>
{:else if gate === "offline"}
  <div class="gate">
    <div class="gate-message">
      <span class="gate-status">offline</span>
      <span class="gate-detail">network unavailable</span>
      <button
        class="gate-action"
        onclick={() => lighthouse.boot(lighthouseInstance).catch(() => {})}>reconnect</button>
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
