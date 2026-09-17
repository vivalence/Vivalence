<script>
  let { terminal, onactivate } = $props();

  const thread = terminal.$thread;
</script>

<div class="row click" onclick={onactivate} role="button" tabindex="0" title={$thread?.id ?? ""}>
  <span class="k">{terminal.id}</span>
  <span class="v mono">{$thread ? "active" : "idle"}</span>
</div>
{#if $thread}
  <div class="row sub"><span class="k">daemon</span><span class="v">{$thread.daemon?.slug}</span></div>
  <div class="row sub"><span class="k">thread</span><span class="v mono">{$thread.id}</span></div>
  <div class="row sub"><span class="k">mode</span><span class="v">{$thread.mode?.name}</span></div>
{/if}

<style>
  .sub {
    padding-left: 30px;
  }
  .sub .k {
    opacity: 0.35;
  }
</style>
