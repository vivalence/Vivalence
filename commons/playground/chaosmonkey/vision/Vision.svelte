<script>
  const { terminal, buffer } = $props();

  const prompt = $derived(buffer.data?.prompt ?? "");
  const vision = $derived(buffer.data?.vision ?? "");
  const mood = $derived(buffer.data?.mood ?? "");

  function back() {
    terminal.buffer = null;
  }
</script>

<div class="vision">
  <div class="eye">◉</div>
  {#if mood}<span class="mood">{mood}</span>{/if}
  <p class="say">{vision || "…the vision is clouded."}</p>
  {#if prompt}<p class="asked">you asked: <span>{prompt}</span></p>{/if}
  <button class="return" onclick={back}>← return</button>
</div>

<style>
  .vision {
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 32px;
    text-align: center;
    background: var(--colors-skeleton-3-surface);
    color: var(--colors-skeleton-3-contrast);
    font-family: var(--font-family-code);
  }
  .eye {
    font-size: var(--font-size-4xl);
    color: var(--colors-skeleton-0-primary-base);
    opacity: 0.85;
  }
  .mood {
    padding: 2px 10px;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--colors-skeleton-0-primary-base);
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-primary-base) 40%, transparent);
    border-radius: 999px;
  }
  .say {
    margin: 0;
    max-width: 34rem;
    font-size: var(--font-size-lg);
    line-height: 1.5;
  }
  .asked {
    margin: 0;
    font-size: var(--font-size-xs);
    opacity: 0.45;
  }
  .asked span {
    color: color-mix(in srgb, currentColor 92%, transparent);
  }
  .return {
    margin-top: 8px;
    padding: 6px 16px;
    font: inherit;
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-0-primary-base);
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-primary-base) 40%, transparent);
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.12s;
  }
  .return:hover {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 14%, transparent);
  }
</style>
