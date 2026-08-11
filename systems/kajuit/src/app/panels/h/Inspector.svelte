<script>
  import { getContext } from "svelte";
  import { LIGHTHOUSE, TERMINALS, BRIDGE } from "$client";
  import { skins } from "@vivalence/drapes";
  import { inspector } from "$telemetry";
  const { Skin } = skins;

  const projection = inspector.project(getContext(LIGHTHOUSE), getContext(TERMINALS), getContext(BRIDGE));
  let nodes = $state(projection.get());
  $effect(() => projection.subscribe((value) => (nodes = value)));
</script>

{#if nodes}
  <Skin {nodes} variant="breadcrumb" />
{/if}
