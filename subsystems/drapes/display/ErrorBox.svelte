<!--
  ErrorBox — display an error message as a styled box.
  Reads the {surface, contrast, boundary} triplet from the current skeleton.
  Error is NOT an interactive role: no hover, no active, no states.
-->
<script>
  import { useSkeleton } from "../context/useSkeleton.js";

  let {
    title = "",
    class: className = "",
    children,
  } = $props();

  const skeleton = useSkeleton();
  const level = $derived(skeleton());

  const boxClasses = $derived(
    `bg-skeleton-${level}-error-surface text-skeleton-${level}-error-contrast border-skeleton-${level}-error-boundary`,
  );
</script>

<div class="rounded border p-3 {boxClasses} {className}" role="alert">
  {#if title}
    <div class="font-medium mb-1">{title}</div>
  {/if}
  {#if children}{@render children()}{/if}
</div>
