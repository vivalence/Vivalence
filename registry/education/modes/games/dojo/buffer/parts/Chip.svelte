<script>
  import { string } from "@vivalence/typology";

  const { token, forgiving = true } = $props();

  let editing = $state(false);
  let corrected = $state(false);
  let value = $state("");

  const landed = $derived(token.signal === "SUCCESS" || token.signal === "MASTERY" || corrected);
  const shown = $derived(landed ? token.form : (token.typed ?? token.form));

  const focus = (node) => node.focus();

  function open() {
    if (landed) return;
    editing = true;
    value = "";
  }

  function commit() {
    if (string.matches(value, token.form, { forgiving })) {
      corrected = true;
      editing = false;
    }
    value = "";
  }

  function onkeydown(event) {
    event.stopPropagation();
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      editing = false;
      value = "";
    }
  }
</script>

{#if editing}
  <div class="chip">
    <input
      class="form input"
      autocomplete="off"
      autocapitalize="off"
      autocorrect="off"
      spellcheck="false"
      writingsuggestions="false"
      use:focus
      bind:value
      size={Math.max(4, (token.form?.length ?? 4) + 1)}
      {onkeydown}
      onblur={commit}
      placeholder={token.form} />
    {#if token.gloss}<span class="gloss">{token.gloss}</span>{/if}
  </div>
{:else}
  <button
    type="button"
    class="chip"
    class:landed
    disabled={landed}
    onmousedown={(event) => event.preventDefault()}
    onclick={open}>
    <span class="form">{shown}</span>
    {#if token.gloss}<span class="gloss">{token.gloss}</span>{/if}
  </button>
{/if}

<style>
  .chip {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.125rem;
    padding: 0.625rem 0.875rem;
    border-radius: 0.5rem;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-1-boundary) 45%, transparent);
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 70%, var(--colors-skeleton-2-surface));
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .chip:disabled {
    cursor: default;
  }
  .form {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-lg);
    line-height: 1.15;
    color: var(--colors-system-warning-contrast);
  }
  .landed .form {
    color: var(--colors-system-success-contrast);
  }
  .gloss {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
  }
  .input {
    background: transparent;
    border: 0;
    outline: none;
    padding: 0;
    width: auto;
  }
  @media (max-width: 640px) {
    .chip {
      padding: 0.5rem 0.625rem;
    }
    .form {
      font-size: var(--font-size-md);
    }
  }
</style>
