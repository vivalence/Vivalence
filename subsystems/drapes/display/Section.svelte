<script>
  let { label, count = null, rule = true, action, open = null, ontoggle = null } = $props();

  function onkeydown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      ontoggle?.();
    }
  }
</script>

{#snippet head()}
  {#if ontoggle}<span class="section-caret">{open === false ? "▸" : "▾"}</span>{/if}
  <span class="section-label">{label}</span>
  {#if rule}<span class="section-rule"></span>{/if}
  {#if count != null}<span class="section-count">{count}</span>{/if}
  {#if action}<span class="section-action">{@render action()}</span>{/if}
{/snippet}

{#if ontoggle}
  <div class="section-head toggleable" class:ruled={rule} role="button" tabindex="0" onclick={ontoggle} {onkeydown}>{@render head()}</div>
{:else}
  <div class="section-head" class:ruled={rule}>{@render head()}</div>
{/if}

<style>
  .section-head {
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .section-label {
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    font-weight: 600;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    color: var(--text-light);
    white-space: nowrap;
  }
  .section-rule {
    flex: 1;
    height: var(--size-ring);
    background: var(--boundary);
  }
  .section-count {
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-light);
  }
  .section-action {
    display: inline-flex;
    align-items: center;
  }
  .section-head.toggleable {
    cursor: pointer;
    user-select: none;
  }
  .section-caret {
    font-size: var(--size-type-2xs);
    color: var(--text-light);
  }
</style>
