<script>
  import Carbon from "./carbon.svelte.js";

  const {
    carbon = "",
    emoji = "",
    size = "md",
    variant = "",
    class: className = "",
    ...restProps
  } = $props();

  const variants = {
    /* nav: "fill-theme-icon-2 hover:fill-interactive-hover-ui", */
    nav: "fill-skeleton-contrast-1",
    ui: "fill-skeleton-contrast-1",
    success: "fill-system-success-contrast hover:fill-system-success-contrast/80",
  };
  const sizes = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
    "2xl": "w-16 h-16",
    "3xl": "w-20 h-20",
    "4xl": "w-24 h-24",
    "5xl": "w-32 h-32",
    "6xl": "w-40 h-40",
    "7xl": "w-48 h-48",
    "8xl": "w-56 h-56",
  };
</script>

{#if !!emoji}
  <span role="img" class="{className} {sizes[size]}" {...restProps}>
    {emoji}
  </span>
{:else if !!carbon}
  <svelte:component
    this={Carbon[carbon]}
    class="{className} {variants[variant]} {sizes[size]}"
    {...restProps} />
{/if}

<!-- aria-hidden={hidden} -->
<!-- aria-label={label} -->
