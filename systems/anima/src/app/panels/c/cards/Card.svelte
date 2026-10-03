<script>
  let {
    name = null,
    label,
    meta = null,
    action,
    framed = false,
    folded = false,
    flowing = false,
    grabbable = false,
    tappable = false,
    dragged = false,
    aimed = false,
    alone = false,
    ongrab = null,
    ontap = null,
    onsolo = null,
    onpark = null,
    children,
  } = $props();

  const keyed = (event) => Boolean(event.target.closest("button"));

  const grab = (event) => {
    if (!grabbable || keyed(event)) return;
    ongrab?.(event, name);
  };

  const tap = (event) => {
    if (!tappable || keyed(event)) return;
    ontap?.(name);
  };
</script>

<section class="card" class:framed class:flowing class:dragged class:aimed>
  <header class="card-head" class:grabbable class:tappable role="presentation" onpointerdown={grab} onclick={tap}>
    <span class="card-label">{label}</span>
    <span class="card-spring"></span>
    {#if meta != null}<span class="card-meta">{meta}</span>{/if}
    {#if action}{@render action()}{/if}
    {#if onsolo}
      <button class="card-chrome" class:latched={alone} title={alone ? "give the tree back" : "solo"} onclick={() => onsolo(name)}>{alone ? "⤡" : "⤢"}</button>
    {/if}
    {#if onpark}
      <button class="card-chrome park" title="park" onclick={() => onpark(name)}>✕</button>
    {/if}
  </header>
  {#if !folded}
    <div class="card-body">{@render children?.()}</div>
  {/if}
</section>

<style>
  .card {
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: var(--surface);
    color: var(--text-strong);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
    font-family: var(--font-family-code);
    font-size: 11px;
    line-height: 1.45;
    overflow: hidden;
    transition: opacity 0.12s, box-shadow 0.12s;
  }
  .card.framed {
    height: 100%;
    min-height: 0;
  }
  .card.framed.flowing {
    height: auto;
  }
  .card.dragged {
    opacity: 0.45;
  }
  .card.aimed {
    box-shadow: 0 0 0 1.5px var(--signal-primary);
  }
  .card-head {
    flex: 0 0 28px;
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    padding: 0 4px 0 10px;
    border-bottom: var(--size-ring) solid var(--boundary);
    user-select: none;
    touch-action: manipulation;
  }
  .card-head.grabbable {
    cursor: grab;
    touch-action: none;
  }
  .card-head.tappable {
    cursor: pointer;
  }
  .card.framed .card-head {
    flex: 0 0 var(--pane-head);
  }
  .card-label {
    flex: none;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    color: var(--text-strong);
  }
  .card-spring {
    flex: 1;
    min-width: 0;
  }
  .card-meta {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 10px;
    color: var(--text-light);
  }
  .card-chrome {
    flex: none;
    width: 22px;
    height: 22px;
    padding: 0;
    border: none;
    border-radius: var(--shape-radius-key);
    background: transparent;
    color: var(--text-light);
    font: inherit;
    font-size: 11px;
    cursor: pointer;
  }
  .card-chrome.park {
    font-size: 12px;
  }
  .card-chrome:hover,
  .card-chrome.latched {
    background: var(--control-selected);
    color: var(--signal-primary-ink);
  }
  .card-body {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 4px 6px 8px;
    background: var(--surface-lift);
    color: var(--text-strong);
  }
  .card.framed .card-body {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }
  .card.framed.flowing .card-body {
    flex: 0 0 auto;
    overflow: visible;
  }

  :global(.card-stack) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 6px 6px calc(8px + var(--size-depth));
  }
  :global(.card-group) {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  :global(.card-list) {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    padding-bottom: var(--size-depth);
  }
  :global(.card-keys) {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-bottom: var(--size-depth);
  }
  :global(.card-name) {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-light);
  }
  :global(.card-dim) {
    font-size: 11px;
    color: var(--text-light);
  }
  :global(.card-heading) {
    font-family: var(--font-family-sans-heading);
    font-size: 15px;
    font-weight: 600;
    color: var(--text-header);
  }
  :global(.card-key) {
    height: 26px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 10px;
    border: none;
    border-radius: var(--shape-radius-key);
    background: var(--control-contrast);
    color: var(--control-on);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary), 0 var(--size-depth) 0 var(--boundary);
    font: inherit;
    font-family: var(--font-family-code);
    font-size: 11.5px;
    font-weight: 500;
    letter-spacing: 0;
    text-transform: none;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    transition: transform 0.07s;
  }
  :global(.card-key:active:not(:disabled)) {
    transform: translateY(var(--size-depth));
    box-shadow: var(--shape-sunk), 0 0 0 var(--size-ring) var(--boundary);
  }
  :global(.card-key.head) {
    height: 22px;
    padding: 0 8px;
    font-size: 10px;
    font-weight: 600;
  }
  :global(.card-key.head:hover) {
    color: var(--signal-primary-ink);
  }
  :global(.card-key.option) {
    height: 24px;
    padding: 0 8px;
    font-size: 9.5px;
  }
  :global(.card-key.square) {
    width: 26px;
    height: 24px;
    padding: 0;
    font-size: 13px;
  }
  :global(.card-key.pressed) {
    background: var(--control-contrast-pressed);
    color: var(--control-on-pressed);
    box-shadow: var(--shape-sunk), 0 0 0 var(--size-ring) var(--boundary);
    transform: translateY(var(--size-depth));
  }
  :global(.card-key:disabled) {
    opacity: 0.45;
    cursor: default;
  }
  :global(.card-pill) {
    height: 22px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 8px;
    border-radius: var(--shape-radius-pill);
    box-shadow: inset 0 0 0 var(--size-ring) var(--boundary-strong);
    color: var(--text-ink);
    font-size: 11px;
    white-space: nowrap;
  }
</style>
