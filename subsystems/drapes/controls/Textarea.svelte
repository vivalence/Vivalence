<script>
  let {
    id = "",
    name = "",
    value = $bindable(""),
    size = "md",
    variant = "primary",
    disabled = false,
    required = false,
    placeholder = "",
    autofocus = false,
    class: className = "",
  } = $props();

  const sizes = {
    sm: "min-h-20 p-3 text-sm",
    md: "min-h-32 p-4 text-base",
    lg: "min-h-48 p-4 text-lg",
  };
</script>

<textarea
  {id}
  {name}
  {disabled}
  {required}
  {placeholder}
  {autofocus}
  bind:value
  class="w-full h-full outline-0 rounded border bg-skeleton-1-surface border-skeleton-1-boundary text-skeleton-1-contrast font-sans-text {sizes[size]} {className}"
/>

<!-- <script> -->
<!--   let { -->
<!--     id = "", -->
<!--     class: className = "", -->
<!--     name = "", -->
<!--     value = $bindable(""), -->
<!--     label = "", -->
<!--     error = "", -->
<!--     success = false, -->
<!--     helper = "", -->
<!--     size = "md", -->
<!--     disabled = false, -->
<!--     required = false, -->
<!--     placeholder = "", -->
<!--     autocomplete = "", -->
<!--     autofocus = false, -->
<!--     type = "text", -->
<!--     variant = "primary", -->
<!--     mode = "default", -->
<!--   } = $props(); -->

<!--   let state = $derived.by(() => { -->
<!--     if (error) return "error"; -->
<!--     if (success) return "success"; -->
<!--     if (disabled) return "disabled"; -->
<!--     return "default"; -->
<!--   }); -->

<!--   const modes = { -->
<!--     default: "", -->
<!--     centered: " text-center", -->
<!--   }; -->
<!--   const sizeClasses = { -->
<!--     sm: "h-8 p-3 text-sm", -->
<!--     md: "h-10 p-4 text-base", -->
<!--     lg: "h-12 p-4 text-lg", -->
<!--     xl: "h-14 p-5 text-xl", -->
<!--   }; -->

<!--   const variantClasses = { -->
<!--     primary: `bg-skeleton-surface-4 border-theme-border-1 text-theme-text-1 focus:border-interactive-focus-accent `, -->
<!--   }; -->

<!--   const stateClasses = { -->
<!--     default: "", -->
<!--     error: "", -->
<!--     success: "", -->
<!--     disabled: "", -->
<!--   }; -->

<!--   const baseClasses = -->
<!--     "w-full h-full outline-0 rounded border transition-colors font-sans-text"; -->

<!--   const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${stateClasses[state]} ${modes[mode]} ${className}`; -->
<!-- </script> -->

<!-- <textarea -->
<!--   {id} -->
<!--   {name} -->
<!--   {type} -->
<!--   {disabled} -->
<!--   {required} -->
<!--   {placeholder} -->
<!--   {autocomplete} -->
<!--   {autofocus} -->
<!--   bind:value -->
<!--   aria-invalid={!!error} -->
<!--   aria-describedby={`${id}-${error ? "error" : "helper"}`} -->
<!--   class={classes} /> -->
