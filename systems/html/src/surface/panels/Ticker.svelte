<script>
  import { Shelve, Box, Text, Pictogram } from "@vivalence/drapes";
  let {
    // left, center, right,
    size = "md",
  } = $props();

  const sizes = {
    xs: "h-6",
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  };
</script>

<div class="bsp-node v3 items-center px-4 {sizes[size]}">
  <div class="flex items-center">
    <!-- {@render left?.()} -->
    <Text variant="brand" size="sm" color="white" weight="medium">
      @vivalence/viva
    </Text>
  </div>

  <div class="flex items-center justify-center">
    <a href="/">
      <!-- {@render center?.()} -->
      <Pictogram
        src="/images/pictogram_viket/pic-vinca-viket_white.png"
        alt="<<"
        size="xl" />
    </a>
  </div>

  <div class="flex items-center justify-end gap-2">
    <!-- {@render right?.()} -->
    <Text variant="heading" size="xs" color="2" class="opacity-60">~</Text>
  </div>
</div>

<!-- {#snippet left()} -->
<!--   <Text variant="brand" size="sm" color="white" weight="medium"> -->
<!--     @vivalence/viva -->
<!--   </Text> -->
<!-- {/snippet} -->
<!-- {#snippet center()} -->
<!--   <Pictogram -->
<!--     src="/images/pictogram_viket/pic-vinca-viket_white.png" -->
<!--     alt="<<" -->
<!--     size="xl" /> -->
<!-- {/snippet} -->
<!-- {#snippet right()} -->
<!--   <Text variant="heading" size="xs" color="2" class="opacity-60">~</Text> -->
<!-- {/snippet} -->
