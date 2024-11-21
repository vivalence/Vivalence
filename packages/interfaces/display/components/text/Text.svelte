<script>
  let {
    id = "",
    variant = "text",
    size = "md",
    spacing,
    weight = "regular",
    color = "1",
    as = "p",
    text = "",
    class: className = "",
    children,
  } = $props();

  const variants = {
    heading: "font-sans-heading",
    text: "font-sans-text",
    ["serif-heading"]: "font-serif-heading",
    ["serif-text"]: "font-serif-text",
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

  const colors = {
    "1": "text-skeleton-contrast-1",
    "2": "text-skeleton-contrast-2",
    "3": "text-skeleton-contrast-3",
    "system-info": "text-system-info-contrast",
    "system-success": "text-system-success-contrast",
    "system-warning": "text-system-warning-contrast",
    "system-error": "text-system-error-contrast",
    "system-disabled": "text-system-disabled-contrast",
    "theme-primary": "text-theme-primary-contrast",
    "theme-secondary": "text-theme-secondary-contrast",
    "theme-accent": "text-theme-accent-contrast",
  };

  const colorClass = colors[color] || color;
  const spacingClass = spacings[spacing || size];
  const base = "";
</script>

<svelte:element
  this={as}
  {id}
  class="{base} {variants[variant]} {sizes[size]} {spacingClass} {weights[
    weight
  ]} {colorClass} {className}">
  {@render children()}
</svelte:element>
