<script>
  import { Text } from "@vivalence/ui";

  export let evaluation;

  let badgeClass = $derived(
    evaluation.status === "KNOWN"
      ? "badge-success"
      : evaluation.status === "NEUTRAL"
        ? "badge-info"
        : "badge-error",
  );

  let badgeText = $derived(
    evaluation.status === "KNOWN" ? "Ok" : evaluation.status === "NEUTRAL" ? "Ish" : "Mistake",
  );
</script>

<div class="card-compact mr-2 mb-2 w-60 flex-initial">
  <div>
    <div class="flex justify-between items-center mb-2">
      <Text size="lg">{evaluation.correction || evaluation.token}</Text>
      <div class="badge {badgeClass} gap-2">{badgeText}</div>
    </div>
    {#if evaluation.feedback}
      <Text size="sm" color="muted">{evaluation.feedback}</Text>
    {/if}
  </div>
</div>
