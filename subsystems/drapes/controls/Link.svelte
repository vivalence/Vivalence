<!--
  Link — the text link colour by default. An active nav link is the primary fill.
-->
<script>
  import { FILL } from "../context/signals.js";

  let {
    href = "",
    variant = "default",
    active = false,
    class: className = "",
    children,
  } = $props();

  const variantClasses = $derived(
    variant === "nav"
      ? `block px-3 py-1.5 rounded text-sm border border-transparent hover:bg-surface-lift ${active ? FILL.primary : "text-strong"}`
      : "text-link hover:underline",
  );
</script>

<a {href} class="{variantClasses} {className}">
  {@render children()}
</a>
