<script>
  import { stamp } from "@vivalence/typology"
  import { familiar } from "./cat.js"

  const cats = [
    { name: "familiar", ...familiar() },
  ]
</script>

<div class="index">
  <h2>cat vectors</h2>
  {#each cats as cat}
    <details>
      <summary>{cat.name}</summary>
      <pre>{JSON.stringify(stamp.press(cat.vector), null, 2)}</pre>
    </details>
  {/each}
</div>

<style>
  .index { font-family: var(--font-family-code); font-size: 11px; }
  h2 { font-size: 14px; margin: 0 0 16px; color: var(--colors-skeleton-0-primary-base); }
  details { margin-bottom: 8px; }
  summary { cursor: pointer; padding: 4px 0; opacity: 0.7; }
  summary:hover { opacity: 1; }
  pre { white-space: pre-wrap; word-break: break-word; padding: 12px; margin: 4px 0; background: var(--colors-skeleton-0-surface); border-radius: 3px; }
</style>
