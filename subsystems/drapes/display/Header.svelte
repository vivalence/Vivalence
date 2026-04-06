<!--
  Header — skeleton-aware. Inherits contrast color from current skeleton.
-->
<script>
  import { useSkeleton } from "../context/useSkeleton.js";

  let {
    as = "h2",
    size = "2xl",
    class: className = "",
    children,
    actions,
  } = $props();

  const skeleton = useSkeleton();
  const level = $derived(skeleton());

  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
  };
</script>

<div class="flex items-center justify-between {className}">
  <svelte:element
    this={as}
    class="font-sans-heading font-semibold text-skeleton-{level}-contrast {sizes[size]}">
    {@render children?.()}
  </svelte:element>
  {#if actions}
    <div class="flex items-center gap-2">
      {@render actions?.()}
    </div>
  {/if}
</div>
