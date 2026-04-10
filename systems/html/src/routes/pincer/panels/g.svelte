<script>
  import { getContext } from "svelte";
  import { BRIDGE } from "$client";

  const { view, toggle } = getContext(BRIDGE);

  let show = $state(view.$g.get());
  view.$g.subscribe(v => show = v);
</script>

{#if show}
  <div class="overlay">
    <div class="modeline">
      <span class="seg hi">G</span>
      <span class="sep">›</span>
      <span class="seg lo">system tray</span>
      <span class="spacer"></span>
      <button class="btn close" onclick={() => toggle("g")}>×</button>
    </div>
    <div class="body">
      <div class="placeholder">— operational alerts —</div>
      <div class="placeholder">— above-the-hood errors —</div>
      <div class="placeholder">— failed generations —</div>
      <div class="placeholder">— i/o schema errors —</div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    top: 16px;
    right: 16px;
    bottom: 16px;
    width: min(300px, calc(100vw - 32px));
    background: var(--colors-skeleton-1-surface);
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-code);
    z-index: 80;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
    overflow: hidden;
  }
  .modeline {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 32px;
    padding: 0 6px 0 14px;
    border-bottom: 1px solid var(--colors-skeleton-0-boundary);
    font-size: 11px;
    text-transform: lowercase;
    letter-spacing: 0.06em;
    flex-shrink: 0;
  }
  .body {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px;
    font-size: 11px;
    color: var(--colors-skeleton-2-contrast);
    -webkit-overflow-scrolling: touch;
  }
  .seg { white-space: nowrap; }
  .seg.hi { color: var(--colors-skeleton-1-contrast); font-weight: 600; }
  .seg.lo { color: var(--colors-skeleton-2-contrast); }
  .sep {
    color: var(--colors-skeleton-0-boundary);
    font-size: 10px;
    flex-shrink: 0;
  }
  .spacer { flex: 1; min-width: 0; }
  .placeholder {
    padding: 6px 0;
    opacity: 0.6;
    border-bottom: 1px dashed var(--colors-skeleton-1-boundary);
  }
  .btn {
    height: 22px;
    min-width: 26px;
    padding: 0 8px;
    background: none;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 4px;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: all 0.12s;
  }
  .btn:hover {
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-skeleton-1-contrast);
  }
  .btn.close {
    border: none;
    font-size: 18px;
    height: 28px;
    padding: 0 10px;
    color: var(--colors-skeleton-2-contrast);
  }
  .btn.close:hover {
    background: var(--colors-skeleton-0-danger-base);
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
