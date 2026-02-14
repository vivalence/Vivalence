<script>
  let {
    variant = "default",
    size = "md",
    removable = false,
    onRemove,
    onclick,
    class: className = "",
    children,
  } = $props();

  const variants = {
    default: "bg-skeleton-1-surface border-skeleton-1-boundary text-skeleton-1-contrast",
    primary: "bg-theme-primary-surface border-theme-primary-boundary text-theme-primary-contrast",
    secondary: "bg-theme-secondary-surface border-theme-secondary-boundary text-theme-secondary-contrast",
    accent: "bg-theme-accent-surface border-theme-accent-boundary text-theme-accent-contrast",
    info: "bg-system-info-surface border-system-info-boundary text-system-info-contrast",
    success: "bg-system-success-surface border-system-success-boundary text-system-success-contrast",
    warning: "bg-system-warning-surface border-system-warning-boundary text-system-warning-contrast",
    danger: "bg-system-danger-surface border-system-danger-boundary text-system-danger-contrast",
    error: "bg-system-error-surface border-system-error-boundary text-system-error-contrast",
  };

  const sizes = {
    xs: "h-4 px-1 text-xs",
    sm: "h-6 px-2 text-xs",
    md: "h-8 px-3 text-sm",
    lg: "h-10 px-4 text-base",
  };
</script>

<span
  class="inline-flex items-center justify-center rounded-full border {variants[variant]} {sizes[size]} {className}"
  {onclick}
>
  {@render children?.()}
  {#if removable}
    <button
      type="button"
      class="ml-1 p-0.5 hover:bg-black/5 rounded-full"
      onclick={(e) => { e.stopPropagation(); onRemove?.(); }}
    >
      <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor">
        <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  {/if}
</span>
<!-- <script> -->
<!--   let { -->
<!--     variant = "default", -->
<!--     size = "md", -->
<!--     removable = false, -->
<!--     onRemove, -->
<!--     class: className = "", -->
<!--       children, -->
<!--   } = $props(); -->

<!--   const makeVariant = (variant) => -->
<!--     `bg-${variant}-surface border-${variant}-boundary text-${variant}-contrast`; -->

<!--   const variants = { -->
<!--     default: `bg-skeleton-surface-1 border-skeleton-boundary-1 text-skeleton-contrast-1`, -->
<!--     primary: makeVariant("theme-primary"), -->
<!--     secondary: makeVariant("theme-secondary"), -->
<!--     accent: makeVariant("theme-accent"), -->
<!--     info: makeVariant("system-info"), -->
<!--     success: makeVariant("system-success"), -->
<!--     warning: makeVariant("system-warning"), -->
<!--     danger: makeVariant("system-danger"), -->
<!--     error: makeVariant("system-error"), -->
<!--     disabled: makeVariant("system-disabled"), -->
<!--   }; -->

<!--   // Size variants -->
<!--   const sizes = { -->
<!--     xs: "h-4 px-1 text-xs", -->
<!--     sm: "h-6 px-2 text-xs", -->
<!--     md: "h-8 px-3 text-sm", -->
<!--     lg: "h-10 px-4 text-base", -->
<!--     xl: "h-12 px-5 text-lg", -->
<!--   }; -->

<!--   // Base tag classes -->
<!--   const baseClasses = -->
<!--     "inline-flex items-center justify-center rounded-full border transition-colors"; -->

<!--   function handleRemove(event) { -->
<!--     event.stopPropagation(); -->
<!--     onRemove?.(); -->
<!--   } -->
<!-- </script> -->

<!-- <span class="{baseClasses} {variants[variant]} {sizes[size]} {className}" on:click> -->
<!--   {@render children()} -->
<!--   {#if removable} -->
<!--     <button -->
<!--       type="button" -->
<!--       class="ml-1 p-0.5 hover:bg-black/5 rounded-full" -->
<!--       onclick={handleRemove} -->
<!--       aria-label="Remove tag"> -->
<!--       <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor"> -->
<!--         <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" /> -->
<!--       </svg> -->
<!--     </button> -->
<!--   {/if} -->
<!-- </span> -->
