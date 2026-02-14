<script>
  let {
    variant = "default",
    padding = "md",
    hover = false,
    onclick,
    disabled = false,
    class: className = "",
    children,
  } = $props();

  const variants = {
    default: "bg-skeleton-1-surface border-skeleton-1-boundary text-skeleton-1-contrast",
    secondary: "bg-skeleton-2-surface border-skeleton-2-boundary text-skeleton-2-contrast",
    ghost: "bg-transparent border-transparent",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-8",
  };
</script>

<div
  class="border rounded-xl {variants[variant]} {paddings[padding]} {hover && !disabled ? 'hover:-translate-y-0.5 hover:shadow-md transition-all' : ''} {disabled ? 'opacity-50 pointer-events-none' : ''} {onclick ? 'cursor-pointer' : ''} {className}"
  {onclick}
  role={onclick ? "button" : "article"}
  tabindex={onclick ? 0 : undefined}
>
  {@render children?.()}
</div>

<!-- <script lang="ts"> -->
<!--   type CardVariant = "default" | "secondary" | "elevated" | "ghost"; -->
<!--   type CardPadding = "none" | "sm" | "md" | "lg"; -->
<!--   type CardAlignment = "start" | "center" | "end"; -->

<!--   let { -->
<!--     // Core props -->
<!--     variant = "default", -->
<!--     padding = "md", -->
<!--     hover = false, -->
<!--     interactive = false, -->
<!--     class: className = "", -->

<!--     // Header props -->
<!--     title = "", -->
<!--     subtitle = "", -->

<!--     // Content props -->
<!--     content = "", -->
<!--     contentAlign = "start", -->

<!--     // Footer props -->
<!--     footer = "", -->
<!--     footerAlign = "start", -->

<!--     // Action props -->
<!--     onClick = undefined, -->

<!--     // Metadata -->
<!--     meta = null, -->

<!--     // Visual options -->
<!--     divider = false, -->
<!--     rounded = "xl", -->
<!--     elevation = "sm", -->

<!--     // State -->
<!--     loading = false, -->
<!--     disabled = false, -->
<!--   } = $props<{ -->
<!--     variant?: CardVariant; -->
<!--     padding?: CardPadding; -->
<!--     hover?: boolean; -->
<!--     interactive?: boolean; -->
<!--     class?: string; -->
<!--     title?: string; -->
<!--     subtitle?: string; -->
<!--     content?: string; -->
<!--     contentAlign?: CardAlignment; -->
<!--     footer?: string; -->
<!--     footerAlign?: CardAlignment; -->
<!--     onClick?: () => void; -->
<!--     meta?: Record<string, any> | null; -->
<!--     divider?: boolean; -->
<!--     rounded?: string; -->
<!--     elevation?: "none" | "sm" | "md" | "lg"; -->
<!--     loading?: boolean; -->
<!--     disabled?: boolean; -->
<!--   }>(); -->

<!--   // Variant styles -->
<!--   const variants = { -->
<!--     default: "bg-theme-ui-1 border-theme-border-1", -->
<!--     secondary: "bg-theme-ui-2 border-theme-border-2", -->
<!--     elevated: "bg-theme-ui-1 border-theme-border-1", -->
<!--     ghost: "bg-transparent border-transparent", -->
<!--   }; -->

<!--   // Padding variants -->
<!--   const paddings = { -->
<!--     none: "", -->
<!--     sm: "p-4", -->
<!--     md: "p-6", -->
<!--     lg: "p-8", -->
<!--   }; -->

<!--   // Elevation styles -->
<!--   const elevations = { -->
<!--     none: "", -->
<!--     sm: "shadow-sm", -->
<!--     md: "shadow-md", -->
<!--     lg: "shadow-lg", -->
<!--   }; -->

<!--   // Alignment utilities -->
<!--   const alignments = { -->
<!--     start: "text-left", -->
<!--     center: "text-center", -->
<!--     end: "text-right", -->
<!--   }; -->

<!--   // Compute state-based classes -->
<!--   let stateClasses = $derived.by(() => { -->
<!--     const classes = []; -->

<!--     if (hover && !disabled) { -->
<!--       classes.push("transition-all duration-200"); -->
<!--       classes.push("hover:-translate-y-0.5 hover:shadow-md"); -->
<!--     } -->

<!--     if (interactive && !disabled) { -->
<!--       classes.push("cursor-pointer"); -->
<!--     } -->

<!--     if (disabled) { -->
<!--       classes.push("opacity-50 pointer-events-none"); -->
<!--     } -->

<!--     if (loading) { -->
<!--       classes.push("animate-pulse"); -->
<!--     } -->

<!--     return classes.join(" "); -->
<!--   }); -->

<!--   // Build the base classes -->
<!--   const baseClasses = [ -->
<!--     "border font-sans-text text-theme-text-1", -->
<!--     "", -->
<!--     `rounded-${rounded}`, -->
<!--     variants[variant], -->
<!--     paddings[padding], -->
<!--     elevations[elevation], -->
<!--     stateClasses, -->
<!--     className, -->
<!--   ].join(" "); -->
<!-- </script> -->

<!-- <div -->
<!--   class={baseClasses} -->
<!--   onclick={!disabled && !loading ? onClick : undefined} -->
<!--   onkeydown={!disabled && !loading ? onClick : undefined} -->
<!--   role={interactive ? "button" : "article"} -->
<!--   tabindex={interactive ? 0 : undefined} -->
<!--   aria-disabled={disabled} -->
<!--   aria-busy={loading}> -->
<!--   {#if title || subtitle || meta} -->
<!--     <div class="space-y-1 {padding !== 'none' ? 'mb-4' : ''}"> -->
<!--       {#if title} -->
<!--         <h3 class="text-lg font-sans-head font-semibold leading-none tracking-tight"> -->
<!--           {title} -->
<!--         </h3> -->
<!--       {/if} -->

<!--       {#if subtitle} -->
<!--         <p class="text-sm"> -->
<!--           {subtitle} -->
<!--         </p> -->
<!--       {/if} -->

<!--       {#if meta} -->
<!--         <div class="flex gap-2 text-sm"> -->
<!--           {#each Object.entries(meta) as [key, value]} -->
<!--             <span>{key}: {value}</span> -->
<!--           {/each} -->
<!--         </div> -->
<!--       {/if} -->
<!--     </div> -->
<!--   {/if} -->

<!--   {#if divider && (title || subtitle || meta)} -->
<!--     <hr class="border-theme-border-2 -mx-6 mb-4" /> -->
<!--   {/if} -->

<!--   {#if content} -->
<!--     <div class={alignments[contentAlign]}> -->
<!--       {content} -->
<!--     </div> -->
<!--   {/if} -->

<!--   {#if footer} -->
<!--     <div class="mt-4 {alignments[footerAlign]}"> -->
<!--       {#if divider} -->
<!--         <hr class="border-theme-border-2 -mx-6 mb-4" /> -->
<!--       {/if} -->
<!--       {footer} -->
<!--     </div> -->
<!--   {/if} -->
<!-- </div> -->

<!-- <style> -->
<!--   div { -->
<!--     transform: translate(0, 0); -->
<!--   } -->
<!-- </style> -->
