<script>
  import "@vivalence/dapper/font.css";
  import "../client.css";

  import { env } from "$env/dynamic/public";
  import { page } from "$app/state";

  import { onMount, setContext } from "svelte";
  import { computed } from "nanostores";

  import { Connection, Url, shard } from "@vivalence/typology";
  import { logger } from "$telemetry";
  import { LIGHTHOUSE, TERMINALS, BRIDGE, BOX } from "$client";
  import { stores } from "@vivalence/anima";
  import { Key } from "@vivalence/drapes";
  import { gateFor } from "./gate.js";
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
      gateFor,
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

{#if page.url.pathname.startsWith("/design")}
  {@render children()}
{:else if gate === "ready"}
  {@render children()}
  {#if terminalCount === 0}
    <div class="empty-overlay" onclick={onOpenTerminal} role="presentation">
      <Key label="open terminal" />
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
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100svh;
    box-sizing: border-box;
    padding: calc(10vh + var(--safe-area-top, 0px)) 16px calc(48px + var(--safe-area-bottom, 0px));
    overflow-y: auto;
    background: var(--surface);
    color: var(--text-strong);
  }
  .empty-overlay {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: grid;
    place-items: center;
    backdrop-filter: blur(12px);
    background: color-mix(in srgb, var(--surface) 70%, transparent);
    cursor: pointer;
  }
</style>
