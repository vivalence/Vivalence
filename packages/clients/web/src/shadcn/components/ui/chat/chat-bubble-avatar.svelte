<script>
  import { Avatar, AvatarImage, AvatarFallback } from "@client/shadcn/components/ui/avatar/index.js";

  let { src, fallback, class: className } = $props();
</script>

<Avatar class={className}>
  <AvatarImage src={src} alt="Avatar" />
  <AvatarFallback>{fallback}</AvatarFallback>
</Avatar>
