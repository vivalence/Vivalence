<script>
  import { Text } from "@vivalence/surface";
  let { service } = $props();
  const manifest = $derived(service.manifest);
  const status = $derived(service.status);
</script>

<div class="">
  <Text size="xl">Service:{$manifest?.slug}</Text>
  <Text size="xl">{$status.code}:{$status.label}</Text>
</div>
