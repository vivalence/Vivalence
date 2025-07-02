<script>
  let {
    id = "",
    name = "",
    value = $bindable(""),
    label = "",
    error = "",
    success = false,
    helper = "",
    size = "md",
    disabled = false,
    required = false,
    placeholder = "",
    autocomplete = "",
    autofocus = false,
    type = "text",
    variant = "primary",
  } = $props();

  let state = $derived.by(() => {
    if (error) return "error";
    if (success) return "success";
    if (disabled) return "disabled";
    return "default";
  });

  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-4 text-lg",
    xl: "h-14 px-5 text-xl",
  };

  const variantClasses = {
    primary: `bg-theme-ui-1 border-theme-border-1 text-theme-text-1
        focus:border-interactive-focus-accent `,
  };

  const stateClasses = {
    default: "",
    error: "",
    success: "",
    disabled: "",
  };

  const baseClasses = "w-full outline-0 rounded border transition-colors font-sans-text";
</script>

<div class="flex flex-col w-full mb-2">
  {#if label}
    <label for={id} class="mb-1.5 text-sm font-medium text-gray-900">
      {label}
      {#if required}
        <span class="text-red-500 ml-0.5">*</span>
      {/if}
    </label>
  {/if}

  <div class="relative">
    <input
      {id}
      {name}
      {type}
      {disabled}
      {required}
      {placeholder}
      {autocomplete}
      {autofocus}
      bind:value
      aria-invalid={!!error}
      aria-describedby={`${id}-${error ? "error" : "helper"}`}
      class="{baseClasses} {sizeClasses[size]} {variantClasses[variant]} {stateClasses[state]}" />

    {#if state === "error"}
      <div class="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500">error icon</div>
    {/if}

    {#if state === "success"}
      <div class="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500">
        success icon
      </div>
    {/if}
  </div>

  {#if error || helper}
    <p
      id={`${id}-${error ? "error" : "helper"}`}
      class="mt-1.5 text-sm {error ? 'text-red-500' : 'text-gray-500'}">
      {error || helper}
    </p>
  {/if}
</div>
