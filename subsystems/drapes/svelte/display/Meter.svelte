<script>
  let { value = 0, tone = "primary" } = $props();
</script>

<span class="meter"><span class="meter-fill {tone}" style:width="{Math.max(0, Math.min(1, value)) * 100}%"></span></span>

<style>
  .meter {
    display: block;
    height: 4px;
    border-radius: var(--shape-radius-xs);
    background: var(--control-field);
    box-shadow: inset 0 0 0 var(--size-ring) var(--boundary);
    overflow: hidden;
  }
  .meter-fill {
    display: block;
    height: 100%;
    transition: width 0.06s linear;
  }
  .meter-fill.primary { background: var(--signal-primary); }
  .meter-fill.positive { background: var(--signal-positive); }
  .meter-fill.caution { background: var(--signal-caution); }
  .meter-fill.negative { background: var(--signal-negative); }
</style>
