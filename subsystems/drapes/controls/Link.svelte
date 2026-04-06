<!--
  Link — skeleton-aware. Default uses primary as the link color.
  Active nav uses primary-base as the active background.
-->
<script>
  import { useSkeleton } from "../context/useSkeleton.js";

  let {
    href = "",
    variant = "default",
    active = false,
    class: className = "",
    children,
  } = $props();

  const skeleton = useSkeleton();
  const level = $derived(skeleton());

  const variantClasses = $derived(
    variant === "nav"
      ? `block px-3 py-1.5 rounded text-sm hover:bg-skeleton-${level}-surface ${
          active
            ? `bg-skeleton-${level}-primary-base text-skeleton-${level}-contrast`
            : `text-skeleton-${level}-contrast`
        }`
      : `text-skeleton-${level}-primary-base hover:underline`,
  );
</script>

<a {href} class="{variantClasses} {className}">
  {@render children()}
</a>
