<script>
  let {
    variant = "default",
    size = "md",
    removable = false,
    onRemove,
    class: className = "",
  } = $props();

  // Tag variants
  const variants = {
    default: "bg-theme-ui-1 border-theme-border-1 text-theme-text-1",
    primary: "bg-theme-primary/10 border-theme-primary/20 text-theme-primary",
    secondary: "bg-theme-secondary/10 border-theme-secondary/20 text-theme-secondary",
    accent: "bg-theme-accent/10 border-theme-accent/20 text-theme-accent",
    success: "bg-system-success-3 border-system-success-2 text-system-success-1",
    warning: "bg-system-warning-3 border-system-warning-2 text-system-warning-1",
    danger: "bg-system-danger-3 border-system-danger-2 text-system-danger-1",
  };

  // Size variants
  const sizes = {
    xs: "h-4 px-1 text-xs",
    sm: "h-6 px-2 text-xs",
    md: "h-8 px-3 text-sm",
    lg: "h-10 px-4 text-base",
    xl: "h-12 px-5 text-lg",
  };

  // Base tag classes
  const baseClasses =
    "inline-flex items-center justify-center rounded-full border transition-colors";

  function handleRemove(event) {
    event.stopPropagation();
    onRemove?.();
  }
</script>

<span class="{baseClasses} {variants[variant]} {sizes[size]} {className}" on:click>
  <slot />
  {#if removable}
    <button
      type="button"
      class="ml-1 p-0.5 hover:bg-black/5 rounded-full"
      on:click={handleRemove}
      aria-label="Remove tag">
      <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor">
        <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  {/if}
</span>
