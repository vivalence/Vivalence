<script>
  let { label, count } = $props();
</script>

<span class="badge"><span class="dot"></span><span class="label">{label}</span><span class="count">{count}</span></span>

<style>
  .badge { display: inline-flex; align-items: center; gap: 10px; padding: 6px 14px; border-radius: 999px; background: var(--surface-inverse); color: var(--ink-inverse); font-size: 15px; letter-spacing: 0.02em; box-shadow: 0 1px 0 var(--accent) inset; font-family: var(--font-body); }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
  .count { font-variant-numeric: tabular-nums; opacity: 0.8; }
</style>
