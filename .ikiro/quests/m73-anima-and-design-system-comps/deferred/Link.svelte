<script>
  import { Key, Pip, Spinner } from "@vivalence/drapes";

  let { lighthouse, onRetry } = $props();

  const status = lighthouse.$status;
  let down = $state(false);
  let toast = $state(false);

  $effect(() => {
    const was = down;
    down = $status.code === "OFFLINE";
    if (was && !down && $status.code === "VERIFIED") {
      toast = true;
      const held = setTimeout(() => (toast = false), 1800);
      return () => clearTimeout(held);
    }
  });
</script>

{#if down}
  <div class="link down">
    <Spinner />
    <span class="link-label">lighthouse unreachable</span>
    <span class="link-sub">{$status.message ?? "retrying"}</span>
    <Key size="row" label="retry now" onclick={onRetry} />
  </div>
{:else if toast}
  <div class="link toast">
    <Pip size={6} tone="success" />
    <span>reconnected · state resumed</span>
  </div>
{/if}

<style>
  .link {
    position: fixed;
    left: 50%;
    top: calc(14px + var(--safe-area-top, 0px));
    transform: translateX(-50%);
    z-index: 120;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    height: var(--size-field);
    padding: 0 8px 0 14px;
    background: var(--surface-lift);
    color: var(--text-strong);
    border-radius: var(--shape-radius-card);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary), var(--shape-lift);
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
  }
  .link.down {
    box-shadow: 0 0 0 var(--size-ring) var(--signal-negative), var(--shape-lift);
  }
  .link-label {
    color: var(--signal-negative-ink);
    font-weight: 600;
  }
  .link-sub {
    color: var(--text-light);
  }
  .link.toast {
    height: var(--size-field);
    padding: 0 14px;
  }
</style>
