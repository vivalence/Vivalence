<script lang="ts">
  type CardVariant = "default" | "secondary" | "elevated" | "ghost";
  type CardPadding = "none" | "sm" | "md" | "lg";
  type CardAlignment = "start" | "center" | "end";

  let {
    // Core props
    variant = "default",
    padding = "md",
    hover = false,
    interactive = false,
    class: className = "",

    // Header props
    title = "",
    subtitle = "",

    // Content props
    content = "",
    contentAlign = "start",

    // Footer props
    footer = "",
    footerAlign = "start",

    // Action props
    onClick = undefined,

    // Metadata
    meta = null,

    // Visual options
    divider = false,
    rounded = "xl",
    elevation = "sm",

    // State
    loading = false,
    disabled = false,
  } = $props<{
    variant?: CardVariant;
    padding?: CardPadding;
    hover?: boolean;
    interactive?: boolean;
    class?: string;
    title?: string;
    subtitle?: string;
    content?: string;
    contentAlign?: CardAlignment;
    footer?: string;
    footerAlign?: CardAlignment;
    onClick?: () => void;
    meta?: Record<string, any> | null;
    divider?: boolean;
    rounded?: string;
    elevation?: "none" | "sm" | "md" | "lg";
    loading?: boolean;
    disabled?: boolean;
  }>();

  // Variant styles
  const variants = {
    default: "bg-theme-ui-1 border-theme-border-1",
    secondary: "bg-theme-ui-2 border-theme-border-2",
    elevated: "bg-theme-ui-1 border-theme-border-1",
    ghost: "bg-transparent border-transparent",
  };

  // Padding variants
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  // Elevation styles
  const elevations = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  // Alignment utilities
  const alignments = {
    start: "text-left",
    center: "text-center",
    end: "text-right",
  };

  // Compute state-based classes
  let stateClasses = $derived(() => {
    const classes = [];

    if (hover && !disabled) {
      classes.push("transition-all duration-200");
      classes.push("hover:-translate-y-0.5 hover:shadow-md");
    }

    if (interactive && !disabled) {
      classes.push("cursor-pointer");
    }

    if (disabled) {
      classes.push("opacity-50 pointer-events-none");
    }

    if (loading) {
      classes.push("animate-pulse");
    }

    return classes.join(" ");
  });

  // Build the base classes
  const baseClasses = [
    "border",
    `rounded-${rounded}`,
    variants[variant],
    paddings[padding],
    elevations[elevation],
    stateClasses,
    className,
  ].join(" ");
</script>

I'll create a more streamlined Card component that combines all the functionality into a single
component while maintaining flexibility. ```svelte
<div
  class={baseClasses}
  on:click={!disabled && !loading ? onClick : undefined}
  on:keydown={!disabled && !loading ? onClick : undefined}
  role={interactive ? "button" : "article"}
  tabindex={interactive ? 0 : undefined}
  aria-disabled={disabled}
  aria-busy={loading}>
  {#if title || subtitle || meta}
    <div class="space-y-1 {padding !== 'none' ? 'mb-4' : ''}">
      {#if title}
        <h3 class="text-lg font-semibold leading-none tracking-tight text-theme-text-1">
          {title}
        </h3>
      {/if}

      {#if subtitle}
        <p class="text-sm text-theme-text-2">
          {subtitle}
        </p>
      {/if}

      {#if meta}
        <div class="flex gap-2 text-sm text-theme-text-3">
          {#each Object.entries(meta) as [key, value]}
            <span>{key}: {value}</span>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  {#if divider && (title || subtitle || meta)}
    <hr class="border-theme-border-2 -mx-6 mb-4" />
  {/if}

  {#if content}
    <div class={alignments[contentAlign]}>
      {content}
    </div>
  {/if}

  {#if footer}
    <div class="mt-4 {alignments[footerAlign]}">
      {#if divider}
        <hr class="border-theme-border-2 -mx-6 mb-4" />
      {/if}
      {footer}
    </div>
  {/if}
</div>

``` Key improvements in this version: 1. **Unified Component**: Combined all card-related
functionality into a single component 2. **Type Safety**: Added TypeScript support with proper type
definitions 3. **Flexible Content**: Can handle various content types through props 4. **Interactive
States**: Added loading, disabled, and interactive states 5. **Better Accessibility**: Proper ARIA
attributes and keyboard navigation 6. **Metadata Support**: Added meta information display
capability 7. **Flexible Layouts**: Multiple alignment options and padding variants 8. **Visual
Customization**: More options for elevation, rounded corners, and dividers 9. **State Management**:
Better state handling with derived classes 10. **Performance**: No unnecessary re-renders Usage
examples: ```svelte
<!-- Basic Card -->
<Card title="Simple Card" subtitle="A brief description" content="Main content goes here" />

<!-- Interactive Card -->
<Card
  variant="elevated"
  hover={true}
  interactive={true}
  onClick={() => console.log("clicked")}
  title="Interactive Card"
  content="Click me!" />

<!-- Card with Metadata -->
<Card
  title="Project Status"
  meta={{
    status: "Active",
    priority: "High",
    deadline: "2024-12-01",
  }}
  content="Project details..."
  footer="Last updated: Today"
  divider={true} />

<!-- Loading Card -->
<Card loading={true} title="Loading..." content="Content loading..." />

<!-- Ghost Card -->
<Card variant="ghost" padding="sm" elevation="none" content="Minimal card with no borders" />
``` This improved version is more flexible and easier to maintain while still providing all the functionality
needed for a robust card component. It handles various use cases from simple content display to interactive
elements, with proper TypeScript support and accessibility features.

<style>
  div {
    transform: translate(0, 0);
  }
</style>
