<!--
  Tag — skeleton-aware. Same shape as Button: variant + size, classes
  templated against the current skeleton level.

  variants: default | primary | secondary | accent | info | success | warning | danger
-->
<script>
  import { useSkeleton } from "../context/useSkeleton.js";

  let {
    variant = "default",
    size = "md",
    removable = false,
    onRemove,
    onclick,
    class: className = "",
    children,
  } = $props();

  const skeleton = useSkeleton();
  const level = $derived(skeleton());

  // `default` uses the structural surface; everything else uses an interactive role.
  const variantClasses = $derived(
    variant === "default"
      ? `bg-skeleton-${level}-surface text-skeleton-${level}-contrast border-skeleton-${level}-boundary`
      : `bg-skeleton-${level}-${variant}-base text-skeleton-${level}-contrast border-skeleton-${level}-${variant}-base`,
  );

  const sizes = {
    xs: "h-4 px-1 text-xs",
    sm: "h-6 px-2 text-xs",
    md: "h-8 px-3 text-sm",
    lg: "h-10 px-4 text-base",
  };
</script>

<span
  class="inline-flex items-center justify-center rounded-full border {variantClasses} {sizes[size]} {className}"
  {onclick}>
  {@render children?.()}
  {#if removable}
    <button
      type="button"
      class="ml-1 p-0.5 hover:bg-black/5 rounded-full"
      onclick={(event) => { event.stopPropagation(); onRemove?.(); }}>
      <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor">
        <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  {/if}
</span>
