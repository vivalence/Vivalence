<script>
  import "@vivalence/dapper/font.css";
  import "../client.css";

  import { env } from "$env/dynamic/public";

  import { onMount, setContext } from "svelte";
  import { computed } from "nanostores";

  import { Connection, Url, shard } from "@vivalence/typology";
  import { logger } from "$telemetry";
  import { LIGHTHOUSE, TERMINALS, BRIDGE, BOX } from "$client";
  import { stores } from "@vivalence/kajuit";
  import * as terminalEffects from "./terminals.js";
  import * as focusEffects from "./focus.js";

  import Login from "./widgets/Login.svelte";
  import Boot from "./widgets/Boot.svelte";

  let { children } = $props();

  let gate = $state("boot");

  let terminalCount = $state(0); // refactor away

  const connection = new Connection(
    new Url(env.PUBLIC_VIVA_LIGHTHOUSE_REMOTE),
    shard.transmitter.retry(shard.transmitter.fetcher, { maxRetries: 2 }),
  );
  connection.use(shard.track.span((call) => call.request.url.pathname, logger.channel));
  const lighthouse = new stores.lighthouse.Lighthouse(connection, { channel: logger.channel });
  stores.lighthouse.hydrate(lighthouse);
  setContext(LIGHTHOUSE, lighthouse);

  const bridge = new stores.bridge.Bridge();
  setContext(BRIDGE, bridge);

  const terminals = new stores.terminals.Terminals();
  setContext(TERMINALS, terminals);

  const box = new stores.box.Box();
  setContext(BOX, box);

  if (typeof window !== "undefined") { // @beef Temporary devtools hack.
    window.__viva = { lighthouse, terminals, bridge, box };
  }

  if (import.meta.env.DEV) {
    logger.channel.tap((record) =>
      console.debug(
        `[${(record.at / 1000).toFixed(3).padStart(8)}]`,
        record.path,
        record.verb,
        record.data ?? "",
      ),
    );
  }

  onMount(() => {
    stores.lighthouse.boot(lighthouse).catch((error) => logger.entry("lighthouse").fault(error));

    const unsubscribeGate = computed(
      [lighthouse.$isAuthorized, lighthouse.$status],
      (authorized, status) => {
        if (!authorized) return "signin";
        if (status.code === "OFFLINE" || status.code === "ERROR") return "signin";
        if (status.code === "POPULATING") return "populating";
        if (status.code !== "VERIFIED") return "verifying";
        return "ready";
      },
    ).subscribe((value) => {
      gate = value;
      logger.entry("gate").note({ message: `gate → ${value}` });
    });

    const unsubscribeTerminals = terminals.$entities.subscribe((entities) => {
      terminalCount = entities.length;
    });

    terminalEffects.hydrate({ terminals });

    const unpersist = terminalEffects.persist({ terminals });
    const unsettle = terminalEffects.settle({ terminals, lighthouse });
    const unfocus = focusEffects.focus({ terminals });

    return () => {
      unfocus();
      unpersist();
      unsettle();
      unsubscribeGate();
      unsubscribeTerminals();
    };
  });

  async function onLogin() {
    stores.lighthouse
      .boot(lighthouse)
      .catch((error) => logger.entry("lighthouse/login").fault(error));
  }

  async function onRetry() {
    stores.lighthouse
      .boot(lighthouse)
      .catch((error) => logger.entry("lighthouse/retry").fault(error));
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
{:else if gate === "signin"}
  <div class="gate">
    <Login {lighthouse} onConnected={onLogin} {onRetry} />
  </div>
{:else}
  <Boot {gate} />
{/if}

<style>
  .gate {
    display: grid;
    place-items: center;
    height: 100svh;
    box-sizing: border-box;
    padding-top: var(--safe-area-top, 0px);
    padding-bottom: var(--safe-area-bottom, 0px);
    background: var(--colors-skeleton-0-surface);
    color: var(--colors-skeleton-0-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.08em;
    text-transform: lowercase;
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
