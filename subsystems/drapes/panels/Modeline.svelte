<script>
  let { left, center, right, size = "sm" } = $props();

  const sizes = {
    xs: "h-6",
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  };
</script>

<div class="bsp-node v3 items-center px-4 {sizes[size]}">
  <div class="flex items-center">
    {@render left?.()}
  </div>

  <div class="flex items-center justify-center">
    {@render center?.()}
  </div>

  <div class="flex items-center justify-end gap-2">
    {@render right?.()}
  </div>
</div>
