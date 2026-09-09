<script>
  let {
    index,
    name,
    digest,
    place,
    tall,
    folded,
    maxed,
    gripping,
    showDigest,
    ongrip,
    onhead,
    onmax,
    onclose,
    children,
  } = $props();

  const strip = $derived(folded && !tall);
  const glyph = $derived(folded ? (tall ? "▾" : "▸") : maxed ? "⤡" : "⤢");
</script>

<div
  class="pane"
  class:folded
  class:maxed
  style:left="{place.left}px"
  style:top="{place.top}px"
  style:width="{place.width}px"
  style:height="{place.height}px">
  {#if strip}
    <div class="strip">
      <div
        class="grip strip-grip"
        class:gripping
        onpointerdown={(event) => ongrip(event, index)}>
        <span class="dots"><i></i><i></i><i></i></span>
      </div>
      <div class="strip-tap" onclick={() => onhead(index)}>
        <span class="strip-name">{name}</span>
      </div>
      <button class="strip-close" onclick={() => onclose(index)} title="dock {name}">✕</button>
    </div>
  {:else}
    <div class="head">
      <div
        class="grip"
        class:gripping
        style:cursor={tall ? "ns-resize" : "ew-resize"}
        onpointerdown={(event) => ongrip(event, index)}>
        <span class="dots" class:across={tall}><i></i><i></i><i></i></span>
      </div>
      <div class="tap" onclick={() => onhead(index)}>
        <span class="name">{name}</span>
        {#if showDigest && place.width >= 260}
          <span class="digest">{digest}</span>
        {/if}
      </div>
      {#if onmax}
        <button class="act" onclick={() => onmax(index)} title={maxed ? "equalise" : "maximise"}>
          {glyph}
        </button>
      {/if}
      <button class="act" onclick={() => onclose(index)} title="dock {name}">✕</button>
    </div>
    {#if !folded}
      <div class="body">{@render children?.()}</div>
    {/if}
  {/if}
</div>

<style>
  .pane {
    position: absolute;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--colors-skeleton-0-surface);
    border-left: 1px solid var(--colors-skeleton-0-boundary);
    border-top: 1px solid var(--colors-skeleton-0-boundary);
    z-index: 1;
  }
  .pane.folded {
    background: var(--colors-skeleton-1-surface);
  }
  .head {
    flex: 0 0 44px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 5px 0 0;
    box-sizing: border-box;
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
    background: var(--colors-skeleton-0-surface);
    white-space: nowrap;
    overflow: hidden;
  }
  .pane.folded .head {
    border-bottom: none;
    background: var(--colors-skeleton-1-surface);
  }
  .pane.maxed .head {
    background: var(--colors-skeleton-2-surface);
  }
  .grip {
    flex: 0 0 26px;
    align-self: stretch;
    display: grid;
    place-items: center;
    touch-action: none;
  }
  .grip.gripping {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 10%, transparent);
  }
  .dots {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .dots.across {
    flex-direction: row;
  }
  .dots i {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--colors-skeleton-0-boundary);
    display: block;
  }
  .grip.gripping .dots i {
    background: var(--colors-skeleton-0-primary-base);
  }
  .tap {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    height: 100%;
    cursor: pointer;
    overflow: hidden;
  }
  .name {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--colors-skeleton-0-primary-base);
    flex: 0 0 auto;
  }
  .pane.folded .name {
    color: var(--colors-skeleton-0-contrast);
  }
  .digest {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--colors-skeleton-0-contrast);
    opacity: 0.7;
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .act {
    flex: 0 0 auto;
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 50%, transparent);
    border-radius: 3px;
    background: var(--colors-skeleton-0-surface);
    color: var(--colors-skeleton-0-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    cursor: pointer;
    opacity: 0.75;
  }
  .act:hover {
    opacity: 1;
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
  }
  .strip {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    background: var(--colors-skeleton-1-surface);
  }
  .strip-grip {
    flex: 0 0 44px;
    align-self: stretch;
    cursor: ew-resize;
  }
  .strip-tap {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    padding-top: 6px;
    cursor: pointer;
    overflow: hidden;
  }
  .strip-name {
    writing-mode: vertical-rl;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--colors-skeleton-0-contrast);
  }
  .strip-close {
    flex: 0 0 34px;
    width: 34px;
    height: 34px;
    margin: 0 0 6px;
    display: grid;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 50%, transparent);
    border-radius: 3px;
    background: var(--colors-skeleton-0-surface);
    color: var(--colors-skeleton-0-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    cursor: pointer;
  }
</style>
