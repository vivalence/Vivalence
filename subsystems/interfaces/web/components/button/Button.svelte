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
    primary:
      "bg-theme-primary-surface border-theme-primary-boundary text-theme-primary-contrast hover:bg-theme-primary-hover-surface focus:bg-theme-primary-focus-surface",
    secondary:
      "bg-theme-secondary-surface border-theme-secondary-boundary text-theme-secondary-contrast hover:bg-theme-secondary-hover-surface focus:bg-theme-secondary-focus-surface",
    accent:
      "bg-theme-accent-surface border-theme-accent-boundary text-theme-accent-contrast hover:bg-theme-accent-hover-surface focus:bg-theme-accent-focus-surface",
    info: "bg-system-info-surface border-system-info-boundary text-system-info-contrast hover:bg-system-info-hover-surface focus:bg-system-info-focus-surface",
    success:
      "bg-system-success-surface border-system-success-boundary text-system-success-contrast hover:bg-system-success-hover-surface focus:bg-system-success-focus-surface",
    warning:
      "bg-system-warning-surface border-system-warning-boundary text-system-warning-contrast hover:bg-system-warning-hover-surface focus:bg-system-warning-focus-surface",
    danger:
      "bg-system-danger-surface border-system-danger-boundary text-system-danger-contrast hover:bg-system-danger-hover-surface focus:bg-system-danger-focus-surface",
    error:
      "bg-system-error-surface border-system-error-boundary text-system-error-contrast hover:bg-system-error-hover-surface focus:bg-system-error-focus-surface",
    disabled:
      "bg-system-disabled-surface border-system-disabled-boundary text-system-disabled-contrast",
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
