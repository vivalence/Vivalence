<script>
  let {
    size = "md",
    class: className = "",
    children,
  } = $props();

  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };
</script>

<p class="font-sans-text text-skeleton-1-contrast {sizes[size]} {className}">
  {@render children?.()}
</p>
