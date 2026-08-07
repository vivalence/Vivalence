<script>
  import { getContext } from "svelte";
  import { BRIDGE } from "$client";
  import { $telemetry as telemetryStore, $span as spanStore } from "$telemetry";
  import { trace } from "@vivalence/typology";

  const bridge = getContext(BRIDGE);

  let show = $state(bridge.view.g);
  bridge.view.$g.subscribe(v => show = v);

  let story = $state(telemetryStore.get());
  telemetryStore.subscribe(value => story = value);

  let selected = $state(spanStore.get());
  spanStore.subscribe(node => selected = node);

  const faulted = (node) => !!node.fault || node.children.some(faulted);

  let faults = $derived(story.roots.filter(faulted));
  let slow = $derived(story.roots.filter((root) => !faulted(root) && trace.duration(root) > 500));
  let recent = $derived(story.roots.filter((root) => !faulted(root) && !(trace.duration(root) > 500)));

  const wire = (node) =>
    node.entries.find((entry) => entry.verb === "response")?.data ??
    node.entries.find((entry) => entry.verb === "request")?.data;

  function select(node) { spanStore.set(node); }
  function back() { spanStore.set(null); }

  function durationClass(duration) {
    if (duration == null) return "";
    if (duration > 1000) return "critical";
    if (duration > 500) return "slow";
    if (duration > 200) return "warm";
    return "";
  }

  function timeAgo(begun) {
    if (!begun) return "";
    const delta = performance.now() - begun;
    if (delta < 1000) return "now";
    if (delta < 60000) return `${Math.floor(delta / 1000)}s ago`;
    return `${Math.floor(delta / 60000)}m ago`;
  }
</script>

{#if show}
  <div class="overlay">
    {#if selected}
      <div class="modeline">
        <button class="btn back" onclick={back}>&larr;</button>
        <span class="seg hi">{selected.nature}</span>
        {#if trace.duration(selected) != null}
          <span class="seg {durationClass(trace.duration(selected))}">{trace.duration(selected).toFixed(0)}ms</span>
        {/if}
        <span class="spacer"></span>
        <span class="span-ago">{timeAgo(selected.timing?.begun)}</span>
        <button class="btn close" onclick={() => bridge.toggle("g")}>x</button>
      </div>

      <div class="detail">
        {#if trace.duration(selected) != null}
          <div class="track-section">
            <div class="track-label">timing</div>
            <div class="track-fields">
              <div class="field-row">
                <span class="field-key">duration</span>
                <span class="field-value {durationClass(trace.duration(selected))}">{trace.duration(selected).toFixed(1)}ms</span>
              </div>
            </div>
          </div>
        {/if}

        {#if selected.entries.length}
          <div class="track-section">
            <div class="track-label">entries</div>
            <div class="track-fields">
              {#each selected.entries as entry, index (index)}
                <div class="field-row">
                  <span class="field-key">{entry.verb}</span>
                  <span class="field-value mono">{JSON.stringify(entry.data)}</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        {#if selected.fault}
          <div class="track-section fault-section">
            <div class="track-label">fault</div>
            <div class="track-fields">
              {#if selected.fault.code}
                <div class="field-row">
                  <span class="field-key">code</span>
                  <span class="field-value error">{selected.fault.code}</span>
                </div>
              {/if}
              {#if selected.fault.message}
                <div class="field-row">
                  <span class="field-key">message</span>
                  <span class="field-value error">{selected.fault.message}</span>
                </div>
              {/if}
            </div>
          </div>
        {/if}

        {#if selected.children.length}
          <div class="track-section">
            <div class="track-label">children ({selected.children.length})</div>
            <div class="children-list">
              {#each selected.children as child, index (child.id)}
                <button class="child-detail" class:has-fault={faulted(child)} onclick={() => select(child)}>
                  <span class="child-index">{index}</span>
                  <span class="child-nature">{child.nature}</span>
                  {#if trace.duration(child) != null}
                    <span class="span-duration {durationClass(trace.duration(child))}">{trace.duration(child).toFixed(0)}ms</span>
                  {/if}
                  {#if wire(child)?.path}
                    <span class="span-path">{wire(child).path}</span>
                  {/if}
                  {#if wire(child)?.status}
                    <span class="span-pill" class:error={wire(child).status >= 400}>{wire(child).status}</span>
                  {/if}
                  {#if child.fault}
                    <span class="span-pill fault">{child.fault.code ?? child.fault.message}</span>
                  {/if}
                  {#if child.children.length}
                    <span class="span-expand">{child.children.length}</span>
                  {/if}
                </button>
              {/each}
            </div>
          </div>

          <div class="track-section">
            <div class="track-label">waterfall</div>
            <div class="waterfall">
              {#each selected.children as child (child.id)}
                {@const parentBegun = selected.timing?.begun ?? 0}
                {@const parentDuration = trace.duration(selected) ?? 1}
                {@const offsetPercent = parentDuration > 0 ? ((child.timing?.begun ?? parentBegun) - parentBegun) / parentDuration * 100 : 0}
                {@const widthPercent = parentDuration > 0 ? (trace.duration(child) ?? 0) / parentDuration * 100 : 0}
                <div class="waterfall-row">
                  <span class="waterfall-label">{child.nature}</span>
                  <div class="waterfall-track">
                    <div
                      class="waterfall-bar {durationClass(trace.duration(child))}"
                      style:left="{Math.max(0, offsetPercent)}%"
                      style:width="{Math.max(1, Math.min(100 - offsetPercent, widthPercent))}%"
                    ></div>
                  </div>
                  <span class="waterfall-ms">{trace.duration(child)?.toFixed(0) ?? "—"}ms</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

    {:else}
      <div class="modeline">
        <span class="seg hi">G</span>
        <span class="sep">&rsaquo;</span>
        <span class="seg lo">telemetry</span>
        <span class="spacer"></span>
        {#if faults.length}
          <span class="seg fault-count">{faults.length}</span>
        {/if}
        <span class="seg count">{story.roots.length}</span>
        <button class="btn close" onclick={() => bridge.toggle("g")}>x</button>
      </div>

      <div class="stream">
        {#if faults.length}
          <div class="section-header fault-header">faults</div>
          {#each [...faults].reverse() as node (node.id)}
            {@render spanRow(node)}
          {/each}
        {/if}

        {#if slow.length}
          <div class="section-header slow-header">slow</div>
          {#each [...slow].reverse() as node (node.id)}
            {@render spanRow(node)}
          {/each}
        {/if}

        {#if recent.length}
          <div class="section-header">recent</div>
          {#each [...recent].reverse() as node (node.id)}
            {@render spanRow(node)}
          {/each}
        {/if}

        {#if story.roots.length === 0}
          <div class="empty">no traces</div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

{#snippet spanRow(node)}
  <button class="span-row" class:has-fault={faulted(node)} onclick={() => select(node)}>
    <span class="span-bar {durationClass(trace.duration(node))}" style:width="{Math.min(100, (trace.duration(node) ?? 0) / 10)}%"></span>
    <span class="span-content">
      <span class="span-nature">{node.nature}</span>
      {#if wire(node)?.path}
        <span class="span-path">{wire(node).path}</span>
      {/if}
      <span class="span-meta">
        {#if trace.duration(node) != null}
          <span class="span-duration {durationClass(trace.duration(node))}">{trace.duration(node).toFixed(0)}ms</span>
        {/if}
        {#if wire(node)?.status}
          <span class="span-pill" class:error={wire(node).status >= 400}>{wire(node).status}</span>
        {/if}
        {#if node.fault}
          <span class="span-pill fault">{node.fault.code ?? node.fault.message}</span>
        {/if}
        {#if node.children.length}
          <span class="span-expand">{node.children.length}</span>
        {/if}
        <span class="span-ago">{timeAgo(node.timing?.begun)}</span>
      </span>
    </span>
  </button>
{/snippet}

<style>
  .overlay {
    position: fixed;
    top: 16px; right: 16px; bottom: 16px;
    width: min(380px, calc(100vw - 32px));
    background: var(--colors-skeleton-0-surface);
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-code);
    z-index: 80;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 12px;
    box-shadow: 0 12px 40px var(--shadow-strong);
    overflow: hidden;
  }
  .modeline {
    display: flex; align-items: center; gap: 8px;
    height: 32px; padding: 0 6px 0 14px;
    border-bottom: 1px solid var(--colors-skeleton-0-boundary);
    font-size: var(--font-size-xs); text-transform: lowercase; letter-spacing: 0.06em;
    flex-shrink: 0;
  }
  .stream, .detail {
    flex: 1; overflow-y: auto; padding: 0;
    font-size: var(--font-size-xs); -webkit-overflow-scrolling: touch;
  }

  .seg { white-space: nowrap; }
  .seg.hi { color: var(--colors-skeleton-1-contrast); font-weight: 600; }
  .seg.lo { color: var(--colors-skeleton-2-contrast); }
  .seg.count { color: var(--colors-skeleton-0-contrast); opacity: 0.4; font-size: var(--font-size-2xs); }
  .seg.fault-count { color: var(--colors-skeleton-0-danger-base); font-weight: 600; font-size: var(--font-size-2xs); }
  .seg.warm { color: var(--colors-skeleton-0-warning-base); }
  .seg.slow { color: var(--colors-skeleton-0-warning-base); font-weight: 600; }
  .seg.critical { color: var(--colors-skeleton-0-danger-base); font-weight: 600; }
  .sep { color: var(--colors-skeleton-0-boundary); font-size: var(--font-size-xs); flex-shrink: 0; }
  .spacer { flex: 1; min-width: 0; }

  .section-header {
    padding: 6px 14px 3px; font-size: var(--font-size-2xs);
    text-transform: uppercase; letter-spacing: 0.12em;
    color: var(--colors-skeleton-2-contrast); opacity: 0.5;
    border-top: 1px solid var(--colors-skeleton-0-boundary);
  }
  .section-header:first-child { border-top: none; }
  .section-header.fault-header { color: var(--colors-skeleton-0-danger-base); opacity: 0.8; }
  .section-header.slow-header { color: var(--colors-skeleton-0-warning-base); opacity: 0.8; }

  .span-row {
    display: block; width: 100%; position: relative;
    padding: 5px 14px; border: none;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 20%, transparent);
    background: none; color: inherit; font: inherit;
    text-align: left; cursor: pointer; overflow: hidden;
  }
  .span-row:hover { background: color-mix(in srgb, var(--colors-skeleton-1-surface) 40%, transparent); }
  .span-row.has-fault { background: color-mix(in srgb, var(--colors-skeleton-0-danger-base) 6%, transparent); }

  .span-bar {
    position: absolute; left: 0; top: 0; bottom: 0;
    opacity: 0.08; background: var(--colors-skeleton-0-primary-base); pointer-events: none;
  }
  .span-bar.warm { background: var(--colors-skeleton-0-warning-base); opacity: 0.1; }
  .span-bar.slow { background: var(--colors-skeleton-0-warning-base); opacity: 0.15; }
  .span-bar.critical { background: var(--colors-skeleton-0-danger-base); opacity: 0.15; }

  .span-content {
    position: relative; display: flex; align-items: center; gap: 6px; min-width: 0;
  }
  .span-nature {
    font-weight: 600; color: var(--colors-skeleton-0-primary-base);
    white-space: nowrap; flex-shrink: 0;
  }
  .span-path {
    color: var(--colors-skeleton-2-contrast); opacity: 0.4;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    min-width: 0; flex: 1;
  }
  .span-meta {
    display: flex; gap: 4px; align-items: center;
    flex-shrink: 0; margin-left: auto;
  }
  .span-duration {
    color: var(--colors-skeleton-2-contrast); opacity: 0.6;
    white-space: nowrap; font-size: var(--font-size-2xs);
  }
  .span-duration.warm { color: var(--colors-skeleton-0-warning-base); opacity: 1; }
  .span-duration.slow { color: var(--colors-skeleton-0-warning-base); opacity: 1; font-weight: 600; }
  .span-duration.critical { color: var(--colors-skeleton-0-danger-base); opacity: 1; font-weight: 600; }

  .span-pill {
    padding: 0 4px; border-radius: 2px;
    border: 1px solid var(--colors-skeleton-0-boundary);
    font-size: var(--font-size-2xs); white-space: nowrap; line-height: 1.4;
  }
  .span-pill.error { border-color: var(--colors-skeleton-0-danger-base); color: var(--colors-skeleton-0-danger-base); }
  .span-pill.fault { border-color: var(--colors-skeleton-0-danger-base); color: var(--colors-skeleton-0-danger-base); }

  .span-expand { color: var(--colors-skeleton-2-contrast); opacity: 0.4; font-size: var(--font-size-2xs); }
  .span-ago { color: var(--colors-skeleton-2-contrast); opacity: 0.25; font-size: var(--font-size-2xs); white-space: nowrap; }

  /* detail view */
  .track-section {
    border-bottom: 1px solid var(--colors-skeleton-0-boundary);
    padding: 8px 14px;
  }
  .track-section.fault-section {
    background: color-mix(in srgb, var(--colors-skeleton-0-danger-base) 6%, transparent);
  }
  .track-label {
    font-size: var(--font-size-2xs); text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--colors-skeleton-2-contrast); opacity: 0.5;
    margin-bottom: 4px;
  }
  .track-fields { display: flex; flex-direction: column; gap: 2px; }
  .field-row {
    display: flex; gap: 8px; align-items: baseline;
    font-size: var(--font-size-xs); padding: 1px 0;
  }
  .field-key {
    color: var(--colors-skeleton-2-contrast); opacity: 0.5;
    min-width: 50px; flex-shrink: 0;
  }
  .field-value { color: var(--colors-skeleton-1-contrast); }
  .field-value.mono {
    font-family: var(--font-family-code);
    overflow-wrap: anywhere;
  }
  .field-value.error { color: var(--colors-skeleton-0-danger-base); }
  .field-value.warm { color: var(--colors-skeleton-0-warning-base); }
  .field-value.slow { color: var(--colors-skeleton-0-warning-base); font-weight: 600; }
  .field-value.critical { color: var(--colors-skeleton-0-danger-base); font-weight: 600; }

  .children-list { display: flex; flex-direction: column; }
  .child-detail {
    display: flex; gap: 5px; align-items: center;
    padding: 3px 0; border: none; background: none;
    color: inherit; font: inherit; text-align: left;
    cursor: pointer; font-size: var(--font-size-2xs);
  }
  .child-detail:hover { background: color-mix(in srgb, var(--colors-skeleton-1-surface) 30%, transparent); }
  .child-detail.has-fault { background: color-mix(in srgb, var(--colors-skeleton-0-danger-base) 4%, transparent); }
  .child-index { color: var(--colors-skeleton-2-contrast); opacity: 0.3; min-width: 12px; }
  .child-nature { color: var(--colors-skeleton-0-primary-base); font-weight: 600; white-space: nowrap; }

  /* waterfall */
  .waterfall { display: flex; flex-direction: column; gap: 2px; padding-top: 4px; }
  .waterfall-row { display: flex; align-items: center; gap: 6px; height: 16px; }
  .waterfall-label {
    font-size: var(--font-size-2xs); color: var(--colors-skeleton-2-contrast);
    min-width: 60px; text-align: right; flex-shrink: 0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .waterfall-track {
    flex: 1; height: 8px; position: relative;
    background: color-mix(in srgb, var(--colors-skeleton-0-boundary) 15%, transparent);
    border-radius: 2px;
  }
  .waterfall-bar {
    position: absolute; top: 0; bottom: 0;
    background: var(--colors-skeleton-0-primary-base);
    border-radius: 2px; min-width: 2px;
  }
  .waterfall-bar.warm { background: var(--colors-skeleton-0-warning-base); }
  .waterfall-bar.slow { background: var(--colors-skeleton-0-warning-base); }
  .waterfall-bar.critical { background: var(--colors-skeleton-0-danger-base); }
  .waterfall-ms {
    font-size: var(--font-size-2xs); color: var(--colors-skeleton-2-contrast); opacity: 0.5;
    min-width: 30px; text-align: right; flex-shrink: 0;
  }

  .empty {
    padding: 24px 14px; color: var(--colors-skeleton-2-contrast);
    opacity: 0.4; text-align: center;
  }
  .btn {
    height: 22px; min-width: 26px; padding: 0 8px;
    background: none; border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 4px; color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code); font-size: var(--font-size-xs);
    font-weight: bold; letter-spacing: 0.08em;
    cursor: pointer; transition: all 0.12s;
  }
  .btn:hover { background: var(--colors-skeleton-2-surface); color: var(--colors-skeleton-1-contrast); }
  .btn.back { font-size: var(--font-size-md); padding: 0 6px; }
  .btn.close {
    border: none; font-size: var(--font-size-base); height: 28px;
    padding: 0 10px; color: var(--colors-skeleton-2-contrast);
  }
  .btn.close:hover { background: var(--colors-skeleton-0-danger-base); color: var(--colors-skeleton-0-danger-base); }
  @media (max-width: 600px) { .overlay { left: 12px; right: 12px; width: auto; } }
</style>
