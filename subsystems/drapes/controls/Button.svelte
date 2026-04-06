<!--
  Button — skeleton-aware. Reads the current skeleton level from context and
  templates its tailwind classes against it. Drop the same Button into a
  level-1 panel and a level-3 panel — colors shift to match the backdrop
  with zero prop changes.

  variants: primary | secondary | accent | info | success | warning | danger
  size:     icon | xs | sm | md | lg | xl
-->
<script>
  import { useSkeleton } from "../context/useSkeleton.js";

  let {
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    onclick,
    class: className = "",
    icon = "",
    iconPosition = "left",
    children,
  } = $props();

  const skeleton = useSkeleton();
  const level = $derived(skeleton());

  // class names are templated against the live skeleton level. tailwind
  // sees the full enumerated set via dapper's safelist export.
  const variantClasses = $derived(
    `bg-skeleton-${level}-${variant}-base
     text-skeleton-${level}-contrast
     border-skeleton-${level}-${variant}-base
     hover:bg-skeleton-${level}-${variant}-hover
     active:bg-skeleton-${level}-${variant}-active`,
  );

  const sizes = {
    icon: "w-10 h-10",
    xs:   "h-6 px-2 text-xs",
    sm:   "h-8 px-3 text-sm",
    md:   "h-10 px-4 text-base",
    lg:   "h-12 px-6 text-lg",
    xl:   "h-14 px-8 text-xl",
  };

  // disabled is rendered via opacity + pointer-events, not a dedicated color.
  const stateClasses = $derived.by(() => {
    if (loading) return "opacity-75 cursor-wait";
    if (disabled) return "opacity-50 cursor-not-allowed pointer-events-none";
    return "";
  });

  const baseClasses =
    "inline-flex items-center justify-center rounded border transition-colors focus:outline-none mb-2";
</script>

<button
  {disabled}
  {onclick}
  class="{baseClasses} {!disabled ? variantClasses : ''} {sizes[size]} {stateClasses} {className}">
  {#if loading}
    <div class="flex items-center space-x-2">
      <div class="w-4 h-4 border-2 border-current rounded-full animate-spin border-t-transparent"></div>
      {#if children}{@render children()}{/if}
    </div>
  {:else}
    {#if icon && iconPosition === "left"}<span class="mr-2">{@html icon}</span>{/if}
    {#if children}{@render children()}{/if}
    {#if icon && iconPosition === "right"}<span class="ml-2">{@html icon}</span>{/if}
  {/if}
</button>
