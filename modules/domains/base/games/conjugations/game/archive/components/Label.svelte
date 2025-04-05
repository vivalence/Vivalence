<script>
  export let evaluation;
  const src =
    evaluation.status === "KNOWN"
      ? "/icons/heroicons/20/solid/check.svg"
      : "/icons/heroicons/20/solid/x-mark.svg";
</script>

<span
  class={`badge
	${evaluation.status === "KNOWN" ? "badge-success" : "badge-error"}
	${evaluation.feedback && "cursor-help"} `}
>
  {#if evaluation.status === "UNKNOWN" && evaluation.feedback}
    <span class="w-5 h-5 text-lg mt-[-7px]">?</span>
  {:else}
    <img class="w-5 h-5" alt={evaluation.status} {src} />
  {/if}
</span>
