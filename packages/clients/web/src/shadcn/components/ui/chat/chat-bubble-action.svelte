<script>
  import { cn } from "@client/shadcn/utils.js";
  import { Button } from "@client/shadcn/components/ui/button/index.js";

  let { 
    icon, 
    onClick,
    class: className,
    variant = "ghost",
    size = "icon",
    ...restProps 
  } = $props();
</script>

<Button
  {variant}
  {size}
  class={className}
  on:click={onClick}
  {...restProps}
>
  {@render icon?.()}
</Button>
