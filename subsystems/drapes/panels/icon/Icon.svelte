<!--
  Icon — skeleton-aware. variant maps to a fill color sourced from the
  current skeleton level.

  variants: nav | ui | success (and any role name from the skeleton)
-->
<script>
  import Carbon from "./carbon.svelte.js";
  import { useSkeleton } from "../../context/useSkeleton.js";

  let {
    carbon = "",
    emoji = "",
    size = "md",
    variant = "ui",
    class: className = "",
    ...rest
  } = $props();

  const skeleton = useSkeleton();
  const level = $derived(skeleton());

  const ROLE_VARIANTS = new Set([
    "primary", "secondary", "accent",
    "info", "success", "warning", "danger",
  ]);

  const variantClass = $derived.by(() => {
    if (variant === "nav" || variant === "ui") return `fill-skeleton-${level}-contrast`;
    if (ROLE_VARIANTS.has(variant)) return `fill-skeleton-${level}-${variant}-base`;
    return "";
  });

  const sizes = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };
</script>

{#if emoji}
  <span class="{sizes[size]} {className}" {...rest}>{emoji}</span>
{:else if carbon}
  {@const C = Carbon[carbon]}
  {#if C}
    <C class="{variantClass} {sizes[size]} {className}" {...rest} />
  {/if}
{/if}
