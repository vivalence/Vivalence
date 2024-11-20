<script>
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

  const variants = {
    accent: "bg-theme-accent text-theme-text-accent hover:bg-theme-hover-accent",

    primary:
      "bg-theme-primary text-theme-text-4 hover:bg-interactive-hover-primary focus:bg-interactive-focus-primary",

    secondary:
      "bg-theme-secondary text-theme-text-4 hover:bg-interactive-hover-secondary focus:bg-interactive-focus-secondary",

    success:
      "bg-system-success-bg text-system-success-text hover:bg-system-success-hover-bg hover:text-system-success-hover-text",
    warning:
      "bg-system-warning-bg text-system-warning-text hover:bg-system-warning-hover-bg hover:text-system-warning-hover-text",
    danger:
      "bg-system-danger-bg text-system-danger-text hover:text-system-danger-hover-text hover:bg-system-danger-hover-bg",
  };

  const sizes = {
    icon: "w-10 h-10",
    xs: "h-6 px-2 text-xs",
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
    xl: "h-14 px-8 text-xl",
  };

  let stateClasses = $derived.by(() => {
    if (loading) return "opacity-75 cursor-wait";
    if (disabled)
      return "opacity-50 cursor-not-allowed bg-interactive-disabled-1 text-interactive-disabled-2";
    return "";
  });

  const baseClasses =
    "inline-flex items-center justify-center rounded transition-colors focus:outline-none mb-2";
</script>

<button
  {disabled}
  {onclick}
  class="{baseClasses} {!disabled && variants[variant]} {sizes[size]} {stateClasses} {className}">
  {#if loading}
    <div class="flex items-center space-x-2">
      <div class="w-4 h-4 border-2 border-current rounded-full animate-spin border-t-transparent" />
      {#if children}
        {@render children()}
      {/if}
    </div>
  {:else}
    {#if icon && iconPosition === "left"}
      <span class="mr-2">{@html icon}</span>
    {/if}
    {#if children}
      {@render children()}
    {/if}
    {#if icon && iconPosition === "right"}
      <span class="ml-2">{@html icon}</span>
    {/if}
  {/if}
</button>
