<script>
  import Row from "./Row.svelte";
  import Json from "./Json.svelte";

  let { thread } = $props();

  let masked = $derived(thread?.trait?.MASKED);
  let hasTrait = $derived(thread?.traits?.includes?.("MASKED") ?? false);
</script>

<Row letter="M" name="masked" status={hasTrait ? "live" : "absent"} statusKind={hasTrait ? "live" : "stub"}>
  {#if masked === undefined}
    <span class="muted">no MASKED config on thread</span>
  {:else}
    <Json value={masked} />
  {/if}
</Row>

<style>
  .muted {
    opacity: 0.35;
    font-size: var(--font-size-2xs);
  }
</style>
