<script>
  import { getContext } from "svelte";
  import { THREAD } from "$client";

  const threadInstance = getContext(THREAD);
  const current = threadInstance.$current;
</script>

<div class="panel">
  {#if $current}
    <pre>{JSON.stringify($current, (key, value) => {
      if (key === "daemon" && value?.slug) return value.slug;
      if (key === "terminal" || key === "context") return undefined;
      if (value instanceof Map || value instanceof Set) return [...value];
      return value;
    }, 2)}</pre>
  {:else}
    <span class="label">E</span>
  {/if}
</div>

<style>
  .panel {
    width: 100%;
    height: 100%;
    overflow: auto;
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-skeleton-2-contrast);
  }
  pre {
    margin: 0;
    padding: 12px;
    font-size: 11px;
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .label {
    display: block;
    text-align: center;
    margin-top: 40%;
    font-size: 36px;
    font-weight: 900;
    opacity: 0.4;
    user-select: none;
  }
</style>
