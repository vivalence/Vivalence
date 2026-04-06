<!--
  Paragraph — skeleton-aware. Inherits contrast color from current skeleton.
-->
<script>
  import { useSkeleton } from "../context/useSkeleton.js";

  let {
    size = "md",
    class: className = "",
    children,
  } = $props();

  const skeleton = useSkeleton();
  const level = $derived(skeleton());

  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };
</script>

<p class="font-sans-text text-skeleton-{level}-contrast {sizes[size]} {className}">
  {@render children?.()}
</p>
