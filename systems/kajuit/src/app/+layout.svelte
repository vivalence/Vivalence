<script>
  import "@vivalence/dapper/font.css";
  import "../client.css";

  import { env } from "$env/dynamic/public";

  import { onMount ,setContext } from "svelte";
  import { computed } from "nanostores";

  import { Connection, Url } from "@vivalence/typology";
  import { LIGHTHOUSE, TERMINALS, BRIDGE } from "$client";
  import { stores } from "@vivalence/kajuit";

  import Login from "@vivalence/kajuit/skins/lighthouse/Login.svelte";

  let { children } = $props();

  let gate = $state("boot");

  let terminalCount = $state(0); // refactor away

  const lighthouse = new stores.lighthouse.Lighthouse(
    new Connection(new Url(env.PUBLIC_VIVA_LIGHTHOUSE_REMOTE)),
  );
  stores.lighthouse.hydrate(lighthouse);
  setContext(LIGHTHOUSE, lighthouse);

  const bridge = new stores.bridge.Bridge();
  setContext(BRIDGE, bridge);

  const terminals = new stores.terminals.Terminals();
  setContext(TERMINALS, terminals);

  if (typeof window !== "undefined") {
    window.__viv = { lighthouse, terminals, bridge /*, box */ };
  }

  onMount(() => {
    stores.lighthouse.boot(lighthouse).catch(console.error);

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
      if (authorized)
        stores.lighthouse
          .populate(lighthouse)
          .then(() => stores.terminals.rehydrate(terminals, lighthouse))
          .catch(console.error);
    });

    const unsubscribeTerminals = terminals.$entities.subscribe((entities) => {
      terminalCount = entities.length;
    });

    return () => {
      unsubscribeGate();
      unsubscribePopulate();
      unsubscribeTerminals();
    };
  });

  async function onReconnect() {
    stores.lighthouse
      .boot(lighthouse)
      .catch((error) => console.error("[lighthouse] reconnect error", error));
  }

  async function onLogin() {
    await stores.lighthouse.boot(lighthouse);
  }

  async function onRetry() {
    stores.lighthouse
      .boot(lighthouse)
      .catch((error) => console.error("[lighthouse] retry error", error));
  }

  function onOpenTerminal() {
    terminals.create();
  }
</script>

{#if gate === "ready"}
  {@render children()}
  {#if terminalCount === 0}
    <div class="empty-overlay" onclick={onOpenTerminal} role="presentation">
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
      <button class="gate-action" onclick={onRetry}>retry</button>
    </div>
  </div>
{:else if gate === "offline"}
  <div class="gate">
    <div class="gate-message">
      <span class="gate-status">offline</span>
      <span class="gate-detail">network unavailable</span>
      <button class="gate-action" onclick={onReconnect}>reconnect</button>
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
    font-size: var(--font-size-2xs);
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
    font-size: var(--font-size-xs);
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
    font-size: var(--font-size-2xs);
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
    font-size: var(--font-size-xs);
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
