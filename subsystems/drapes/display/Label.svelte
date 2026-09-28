<!--
  Label — the strong text step.
  Required marker uses the danger role (no separate error contrast slot).
-->
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

<label
  class="font-sans-text font-medium text-strong {sizes[size]} {className}"
  {...rest}>
  {@render children?.()}
  {#if required}
    <span class="ml-0.5 text-signal-negative-ink">*</span>
  {/if}
</label>
