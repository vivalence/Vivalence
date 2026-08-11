<script>
  import { Asset } from "@vivalence/drapes";
  import Chip from "./Chip.svelte";

  const { result, typed, answer, example, note, forgiving = true, asset = null } = $props();

  const landed = $derived(result.signal === "SUCCESS" || result.signal === "MASTERY");
</script>

<div class="divider"></div>

<div class="eval">
  <div class="verdict">
    <span class="signal" class:landed>{result.signal}</span>
    <span class="how">{note}</span>
    {#if asset}<div class="audio"><Asset {asset} variant="dot" autoplay={true} /></div>{/if}
  </div>

  {#if result.tokens}
    <div class="chips">
      {#each result.tokens as token, index (token.form + index)}
        <Chip {token} {forgiving} />
      {/each}
    </div>
  {:else if !landed}
    <div class="expected">
      <div class="pair">
        <span class="pair-key">you wrote</span>
        <span class="pair-value wrong">{typed?.trim() || "—"}</span>
      </div>
      <div class="pair">
        <span class="pair-key">expected</span>
        <span class="pair-value right">{answer}</span>
      </div>
    </div>
  {/if}

  {#if example}
    <p class="example">{example}</p>
  {/if}

  {#if result.feedback}
    <p class="note">{result.feedback}</p>
  {/if}

  {#each (result.tokens ?? []).filter((token) => token.feedback) as token, index (token.form + index)}
    <p class="note">
      <span class="note-key">{token.form}</span>
      {token.correction ? `→ ${token.correction} · ` : ""}{token.feedback}
    </p>
  {/each}
</div>

<style>
  .divider {
    height: 1px;
    background: color-mix(in srgb, var(--colors-skeleton-1-boundary) 60%, transparent);
    margin: 1.75rem 0 1.5rem 0;
  }
  .eval {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .verdict {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
  }
  .signal {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--colors-system-error-contrast);
  }
  .signal.landed {
    color: var(--colors-system-success-contrast);
  }
  .how {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-base);
    color: var(--text-support);
  }
  .audio {
    margin-left: auto;
    display: flex;
    align-items: center;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .expected {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }
  .pair {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  .pair-key {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
  }
  .pair-value {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-lg);
  }
  .wrong {
    color: var(--colors-system-error-contrast);
  }
  .right {
    color: var(--colors-system-success-contrast);
  }
  .example {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-base);
    color: var(--text-support);
    font-style: italic;
    margin: 0;
  }
  .note {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-sm);
    color: var(--text-support);
    margin: 0;
  }
  .note-key {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-system-warning-contrast);
  }

  @media (max-width: 640px) {
    .divider {
      margin: 1rem 0;
    }
    .eval {
      gap: 0.75rem;
    }
    .chips {
      gap: 0.375rem;
    }
  }
</style>
