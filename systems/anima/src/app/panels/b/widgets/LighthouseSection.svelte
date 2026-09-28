<script>
  import { getContext } from "svelte";
  import { stores } from "@vivalence/anima";
  import { Card, Key, Pip, Reading, Row, Section } from "@vivalence/drapes";
  import { LIGHTHOUSE } from "$client";
  import { logger } from "$telemetry";

  let { open = true, ontoggle = null } = $props();

  const HEALTH = { healthy: "success", error: "danger" };

  const lighthouse = getContext(LIGHTHOUSE);
  const status = lighthouse.$status;
  const identity = lighthouse.$identity;
  const daemons = lighthouse.$daemons;

  const remote = lighthouse.connection.url.href;
  const host = URL.canParse(remote) ? new URL(remote).host : remote;
  const code = $derived(($status?.code ?? "—").replaceAll("_", " ").toLowerCase());
  const tone = $derived(
    ["ERROR", "OFFLINE", "SESSION_EXPIRED"].includes($status?.code)
      ? "danger"
      : $status?.code === "VERIFIED"
        ? "success"
        : "primary",
  );
  const reflected = (daemon) => daemon.status?.reflection?.code?.toLowerCase() ?? "—";

  const refresh = () =>
    stores.lighthouse.boot(lighthouse).catch((error) => logger.entry("lighthouse/refresh").fault(error));
</script>

<Section label="auth" count={host} {open} {ontoggle} />
{#if open}
  <Card>
    <div class="identity">
      <span class="avatar">{($identity?.slug ?? "?").charAt(0).toUpperCase()}</span>
      <span class="identity-name">{$identity?.slug ?? "—"}</span>
      <span class="identity-state"><Pip size={6} {tone} pulse={tone === "primary"} />{code}</span>
      <span class="identity-address">{remote}</span>
    </div>
    <Reading label="status">{code}</Reading>
    <Reading label="daemons">{($daemons ?? []).length}</Reading>
    <div class="verbs">
      <Key size="row" label="refresh" onclick={refresh} />
      <Key size="row" tone="negative" label="sign out" onclick={() => lighthouse.logout()} />
    </div>
  </Card>
  <Section label="daemons" count={($daemons ?? []).length} />
  <div class="roster">
    {#each $daemons ?? [] as daemon (daemon.slug)}
      <Row>
        <Pip size={6} tone={HEALTH[reflected(daemon)] ?? "primary"} />
        <span class="daemon-name">{daemon.slug}</span>
        <span class="daemon-code">{reflected(daemon)}</span>
      </Row>
    {:else}
      <span class="none">no daemons</span>
    {/each}
  </div>
{/if}

<style>
  .identity {
    display: grid;
    grid-template-columns: 26px minmax(0, 1fr) auto;
    align-items: center;
    gap: 2px 10px;
  }
  .avatar {
    grid-row: 1 / 3;
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    border-radius: var(--shape-radius-disc);
    background: var(--surface-sunk);
    box-shadow: inset 0 0 0 var(--size-ring) var(--boundary);
    color: var(--signal-primary-ink);
    font-family: var(--font-family-code);
    font-size: var(--size-type-xs);
    font-weight: 600;
  }
  .identity-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--size-type-sm);
    font-weight: 600;
  }
  .identity-state {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    font-weight: 600;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    color: var(--text-light);
  }
  .identity-address {
    grid-column: 2 / 4;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-light);
  }
  .verbs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-bottom: var(--size-depth);
  }
  .roster {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .daemon-name {
    flex: 1 1 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
    color: var(--text-strong);
  }
  .daemon-code,
  .none {
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-light);
  }
  .none {
    padding: 6px 8px;
  }
</style>
