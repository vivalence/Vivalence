<script>
	import { Avatar as AvatarPrimitive } from "bits-ui";
	import { cn } from "@client/shadcn/utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<AvatarPrimitive.Fallback
	bind:ref
	class={cn("bg-muted flex size-full items-center justify-center", className)}
	{...restProps}
/>
