<!--
  Icon — variant maps to a fill colour: text ink for nav and ui, a signal's ink for a role.

  variants: nav | ui | primary | secondary | accent | info | success | warning | danger
-->
<script>
  import Carbon from "./carbon.svelte.js";
  import { GLYPH, SIGNAL } from "../../context/signals.js";

  let {
    carbon = "",
    emoji = "",
    size = "md",
    variant = "ui",
    class: className = "",
    ...rest
  } = $props();

  const variantClass = $derived(variant === "nav" || variant === "ui" ? "fill-light" : (GLYPH[SIGNAL[variant]] ?? ""));

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
