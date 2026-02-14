<script>
  let {
    href = "",
    variant = "default",
    active = false,
    class: className = "",
    children,
  } = $props();

  const variants = {
    default: "text-skeleton-app-link hover:underline",
    nav: "block px-3 py-1.5 rounded text-sm hover:bg-skeleton-2-surface",
  };

  const activeClass = active 
    ? "bg-theme-primary-surface text-theme-primary-contrast" 
    : "text-skeleton-1-contrast";
</script>

<a 
  {href} 
  class="{variants[variant]} {variant === 'nav' ? activeClass : ''} {className}"
>
  {@render children()}
</a>
