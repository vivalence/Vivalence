<script>
  import { getStore } from "../store.js";
  const store = getStore();
</script>

<div class="fixed top-0 left-0 right-0 w-full bg-base-100/80 pt-6 pb-3">
  <div class="container mx-auto flex flex-row items-center justify-center">
    {#each $store.session as session, i (session.tactic.id)}
      <div
        data-tip="{session.tactic.name}"
        class="{`w-full max-w-56 mr-2 tooltip flex flex-col items-center justify-center
		${i / $store.session.length >= 0.5 ? 'tooltip-left' : 'tooltip-right'} `}">
        <progress
          class="{`progress ${session.active && 'progress-primary'} w-full max-w-56 mr-2`}"
          value="{session.progress}"
          max="{session.for.value}"></progress>

        <span class="text-xs text-base-content/60">{session.progress}/{session.for.value}</span>
      </div>
    {/each}
  </div>
</div>
