<!--
  Label — skeleton-aware. Reads contrast from the current skeleton.
  Required marker uses the danger role (no separate error contrast slot).
-->
<script>
  import { useSkeleton } from "../context/useSkeleton.js";

  let {
    required = false,
    size = "md",
    class: className = "",
    children,
    ...rest
  } = $props();

  const skeleton = useSkeleton();
  const level = $derived(skeleton());

  const sizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };
</script>

<label
  class="font-sans-text font-medium text-skeleton-{level}-contrast {sizes[size]} {className}"
  {...rest}>
  {@render children?.()}
  {#if required}
    <span class="ml-0.5 text-skeleton-{level}-danger-base">*</span>
  {/if}
</label>
