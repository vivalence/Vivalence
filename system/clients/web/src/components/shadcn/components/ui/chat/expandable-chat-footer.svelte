<script>
  import { cn } from "@client/shadcn/utils.js";

  let { ref = $bindable(null), class: className, children, ...restProps } = $props();
</script>

<div 
  bind:this={ref}
  class={cn("border-t p-4", className)}
  {...restProps}
>
  {@render children?.()}
</div>
