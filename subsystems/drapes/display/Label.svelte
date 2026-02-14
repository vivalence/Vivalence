<script>
  let {
    required = false,
    size = "md",
    class: className = "",
    children,
    ...rest
  } = $props();

  const sizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };
</script>

<label class="font-sans-text font-medium text-skeleton-1-contrast {sizes[size]} {className}" {...rest}>
  {@render children?.()}
  {#if required}<span class="text-system-error-contrast ml-0.5">*</span>{/if}
</label>
