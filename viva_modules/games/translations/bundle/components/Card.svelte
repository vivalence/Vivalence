<script>
  // export let known;
  export let token;
  // export let tags;

  export let evaluation;

  let color = {};
  let content = {};

  $: switch (evaluation.status) {
    case "KNOWN":
      color.badge = "badge-success";
      content.badge = "Ok";
      break;
    case "NEUTRAL":
      color.badge = "badge-info";
      content.badge = "Ish";
      break;
    case "UNKNOWN":
      color.badge = "badge-error";
      content.badge = "Mistake";
      break;
  }
</script>

<div class="card card-compact bg-base-200 mr-2 mb-2 w-60 flex-initial">
  <div class="card-body">
    <h2 class="card-title text-base-content">
      {evaluation.correction || token}
      <div class={`badge ${color.badge} gap-2`}>{content.badge}</div>
    </h2>
    <p class="text-base-content/70 text-sm">{evaluation.feedback}</p>
  </div>
</div>

<!-- <div class={`p-4 border border-1 ${color.border} bg-surface-100/90 rounded-md h-full relative`}> -->
<!--     {#if evaluation.feedback} -->
<!--         <div class="card p-2 variant-filled-surface max-w-xs w-max" > -->
<!--             <p class="text-m">{evaluation.feedback}</p> -->
<!--             <div class="arrow" /> -->
<!--         </div> -->
<!--     {/if} -->

<!--     <h3 class={`text-2xl font-bold ${color.text} mb-1`}> -->
<!--         {token} -->
<!--         {#if evaluation.correction && evaluation.status === "UNKNOWN"} -->
<!--             <span class={`font-bold italic text-gray-700`}> {evaluation.correction}</span> -->
<!--         {:else if evaluation.status === "KNOWN"} -->
<!--         {/if} -->
<!--     </h3> -->

<!--     <\!-- {#if spoken} -\-> -->
<!--     <\!--     <p class="text-gray-900 mb-2">{spoken}</p> -\-> -->
<!--     <\!-- {/if} -\-> -->

<!--     <\!-- {#if tags} -\-> -->
<!--     <\!--     <div class="flex flex-wrap gap-1 mt-2 max-w-[calc(100%-1rem)]"> -\-> -->
<!--     <\!--         {#each tags.filter((t) => t.name) as tag} -\-> -->
<!--     <\!--             {#if tag.name} -\-> -->
<!--     <\!--                 <span -\-> -->
<!--     <\!--                     class={`flex-grow-0 flex-shrink-0 text-xs px-2 py-1 rounded-full text-gray-700 border ${color.border}`} -\-> -->
<!--     <\!--                 > -\-> -->
<!--     <\!--                     {tag.name} -\-> -->
<!--     <\!--                 </span> -\-> -->
<!--     <\!--             {/if} -\-> -->
<!--     <\!--         {/each} -\-> -->
<!--     <\!--     </div> -\-> -->
<!--     <\!-- {/if} -\-> -->
<!-- </div> -->
