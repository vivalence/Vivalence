<script>
  import { getContext } from "svelte";
  import { LIGHTHOUSE, BRIDGE } from "$client";

  const lighthouse = getContext(LIGHTHOUSE);
  const { view, toggle } = getContext(BRIDGE);

  let show = $state(view.$inspectLighthouse.get());
  view.$inspectLighthouse.subscribe(v => show = v);

  let isAuthorized = $state(lighthouse.$isAuthorized.get());
  let isIdentified = $state(lighthouse.$isIdentified.get());
  let status = $state(lighthouse.$status.get());
  let identity = $state(lighthouse.$identity.get());
  let authority = $state(lighthouse.$authority.get());
  let connectionState = $state(lighthouse.connection.$state.get());
  let connectionError = $state(lighthouse.connection.$error.get());
  let daemons = $state(lighthouse.$daemons.get());

  lighthouse.$isAuthorized.subscribe(v => isAuthorized = v);
  lighthouse.$isIdentified.subscribe(v => isIdentified = v);
  lighthouse.$status.subscribe(v => status = v);
  lighthouse.$identity.subscribe(v => identity = v);
  lighthouse.$authority.subscribe(v => authority = v);
  lighthouse.connection.$state.subscribe(v => connectionState = v);
  lighthouse.connection.$error.subscribe(v => connectionError = v);
  lighthouse.$daemons.subscribe(v => daemons = v);

  function truncate(text, max = 32) {
    if (text == null) return "null";
    const string = String(text);
    return string.length > max ? string.slice(0, max) + "…" : string;
  }
</script>

{#if show}
  <div class="overlay">
    <div class="modeline">
      <span class="seg hi">L</span>
      <span class="sep">›</span>
      <span class="seg lo">lighthouse</span>
      <span class="spacer"></span>
      <button class="btn close" onclick={() => toggle("inspectLighthouse")}>×</button>
    </div>
    <div class="body">
      <div class="row"><span class="k">$isAuthorized</span><span class="v">{isAuthorized}</span></div>
      <div class="row"><span class="k">$isIdentified</span><span class="v">{isIdentified}</span></div>
      <div class="row"><span class="k">$status.code</span><span class="v">{status?.code ?? "—"}</span></div>
      <div class="row"><span class="k">$identity.slug</span><span class="v">{identity?.slug ?? "—"}</span></div>
      <div class="row"><span class="k">$identity.id</span><span class="v mono">{truncate(identity?.id, 20)}</span></div>
      <div class="row"><span class="k">$authority.access</span><span class="v mono">{truncate(authority?.access, 20)}</span></div>
      <div class="row"><span class="k">connection.$state</span><span class="v">{connectionState}</span></div>
      <div class="row"><span class="k">connection.$error</span><span class="v">{connectionError ?? "—"}</span></div>
      <div class="row"><span class="k">daemons.size</span><span class="v">{daemons?.length ?? 0}</span></div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    top: 58px;
    left: 8px;
    width: calc(25vw - 12px);
    max-width: 320px;
    max-height: calc(100vh - 74px);
    background: var(--colors-skeleton-1-surface);
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-code);
    z-index: 79;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--colors-skeleton-0-accent-base);
    border-radius: 8px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
    overflow: hidden;
  }
  .modeline {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 4px 0 12px;
    border-bottom: 1px solid var(--colors-skeleton-0-boundary);
    font-size: 10px;
    text-transform: lowercase;
    letter-spacing: 0.06em;
    flex-shrink: 0;
  }
  .body {
    flex: 1;
    overflow-y: auto;
    padding: 6px 0;
    font-size: 10px;
    -webkit-overflow-scrolling: touch;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 12px;
    border-bottom: 1px dashed var(--colors-skeleton-1-boundary);
  }
  .row:last-child { border-bottom: none; }
  .k {
    color: var(--colors-skeleton-2-contrast);
    flex: 0 0 42%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .v {
    color: var(--colors-skeleton-1-contrast);
    flex: 1;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .v.mono { font-feature-settings: "tnum"; opacity: 0.8; }
  .seg.hi { color: var(--colors-skeleton-0-accent-base); font-weight: 600; }
  .seg.lo { color: var(--colors-skeleton-2-contrast); }
  .sep { color: var(--colors-skeleton-0-boundary); font-size: 10px; }
  .spacer { flex: 1; }
  .btn {
    height: 22px;
    min-width: 24px;
    padding: 0 6px;
    background: none;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 4px;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: 10px;
    cursor: pointer;
  }
  .btn.close {
    border: none;
    font-size: 16px;
    height: 24px;
  }
  .btn.close:hover {
    color: var(--colors-skeleton-0-danger-base);
  }
  @media (max-width: 600px) {
    .overlay {
      left: 12px;
      right: 12px;
      width: auto;
    }
  }
</style>
