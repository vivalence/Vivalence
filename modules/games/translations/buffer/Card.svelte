<script>
  import { Text, Tag } from "@vivalence/interface";

  let { unit, evaluation } = $props();
</script>

<div class="mb-3">
  {#if evaluation.correction}
    <Text>{evaluation.correction}</Text>
  {/if}

  {#if evaluation.feedback}
    <Text size="sm">{evaluation.feedback}</Text>
  {/if}
</div>
