<!--
  Text — skeleton-aware. The `color` prop accepts:
    - "contrast"  → skeleton.contrast (default)
    - role names: primary | secondary | accent | info | success | warning | danger
                  → skeleton.<role>.base
    - any literal class string → passed through verbatim (escape hatch)

  Variant + size + spacing + weight stay structural.
-->
<script>
  import { useSkeleton } from "../context/useSkeleton.js";

  let {
    id = "",
    variant = "text",
    size = "md",
    spacing,
    weight = "regular",
    mode = "default",
    color = "contrast",
    as = "p",
    text = "",
    class: className = "",
    children,
  } = $props();

  const skeleton = useSkeleton();
  const level = $derived(skeleton());

  const variants = {
    heading: "font-sans-heading",
    text: "font-sans-text",
    "serif-heading": "font-serif-heading",
    "serif-text": "font-serif-text",
    brand: "font-brand",
    code: "font-code",
  };

  const sizes = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
    "6xl": "text-6xl",
    "7xl": "text-7xl",
    "8xl": "text-8xl",
    "9xl": "text-9xl",
  };

  const spacings = {
    xs: "",
    sm: "mb-1",
    md: "mb-2",
    lg: "mb-3",
    xl: "mb-4",
    "2xl": "mb-5",
    "3xl": "mb-6",
    "4xl": "mb-7",
    "5xl": "mb-8",
    "6xl": "mb-9",
    "7xl": "mb-10",
    "8xl": "mb-11",
    "9xl": "mb-12",
  };

  const weights = {
    thin: "font-thin",
    light: "font-light",
    regular: "font-regular",
    medium: "font-medium",
    bold: "font-bold",
  };

  const ROLE_COLORS = new Set([
    "primary", "secondary", "accent",
    "info", "success", "warning", "danger",
  ]);

  const colorClass = $derived.by(() => {
    if (color === "contrast") return `text-skeleton-${level}-contrast`;
    if (ROLE_COLORS.has(color)) return `text-skeleton-${level}-${color}-base`;
    // escape hatch — pass literal class string through
    return color;
  });

  const spacingClass = spacings[spacing || size];

  const modes = {
    default: "",
    centered: "flex items-center justify-center text-center",
  };
</script>

<svelte:element
  this={as}
  {id}
  class="{modes[mode]} {variants[variant]} {sizes[size]} {spacingClass} {weights[weight]} {colorClass} {className}">
  {@render children()}
</svelte:element>
