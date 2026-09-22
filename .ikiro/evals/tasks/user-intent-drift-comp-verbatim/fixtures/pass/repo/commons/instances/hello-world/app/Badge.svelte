<script>
  let { label, count } = $props();
</script>

<span class="badge"><span class="dot"></span><span class="label">{label}</span><span class="count">{count}</span></span>

<style>
  .badge { display: inline-flex; align-items: center; gap: 10px; padding: 6px 14px; border-radius: 999px; background: #1F2A44; color: #F4E9D8; font-size: 15px; letter-spacing: 0.02em; box-shadow: 0 1px 0 #C9A96E inset; font-family: "Instrument Serif", serif; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #C9A96E; }
  .count { font-variant-numeric: tabular-nums; opacity: 0.8; }
</style>
