<script>
  import { cn } from "@client/shadcn/utils.js";
  import { Textarea } from "@client/shadcn/components/ui/textarea/index.js";

  let { value = $bindable(""), class: className, ...restProps } = $props();
</script>

<Textarea
  bind:value
  name="message"
  autoComplete="off"
  class={cn(
    "max-h-12 px-4 py-3 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center h-16 resize-none",
    className,
  )}
  {...restProps} />
