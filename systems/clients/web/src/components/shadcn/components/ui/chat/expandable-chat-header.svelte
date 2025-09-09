<script>
  import { cn } from "@client/shadcn/utils.js";

  let { ref = $bindable(null), class: className, children, ...restProps } = $props();
</script>

<div 
  bind:this={ref}
  class={cn("flex items-center justify-between p-4 border-b", className)}
  {...restProps}
>
  {@render children?.()}
</div>
