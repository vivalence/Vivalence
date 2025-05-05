<script>
  import { cn } from "@client/shadcn/utils.js";

  let { 
    ref = $bindable(null),
    class: className,
    variant = "received", 
    children,
    ...restProps 
  } = $props();
</script>

<div
  bind:this={ref}
  class={cn(
    "absolute top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200",
    variant === "sent"
      ? "-left-1 -translate-x-full flex-row-reverse"
      : "-right-1 translate-x-full",
    className
  )}
  {...restProps}
>
  {@render children?.()}
</div>
