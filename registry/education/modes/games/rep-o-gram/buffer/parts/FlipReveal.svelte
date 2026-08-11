<script>
  import { Asset } from "@vivalence/drapes";

  const { answer, example, asset = null, label } = $props();
</script>

<div class="divider"></div>
<div class="reveal">
  <span class="label">{label}</span>
  <div class="row">
    <div class="text">
      <p class="answer">{answer}</p>
      {#if example}<p class="example">{example}</p>{/if}
    </div>
    {#if asset}<Asset autoplay={true} variant="dot" {asset} />{/if}
  </div>
</div>

<style>
  .divider {
    height: 1px;
    background: var(--colors-skeleton-1-boundary);
    margin: 1.5rem 0;
  }
  .reveal {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .label {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--text-support);
  }
  .row {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }
  .text {
    flex: 1;
    min-width: 0;
  }
  .answer {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-xl);
    color: var(--colors-theme-primary-contrast);
    margin: 0;
    line-height: 1.2;
  }
  .example {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-base);
    color: var(--text-support);
    font-style: italic;
    margin: 0.75rem 0 0 0;
  }
</style>
