<script>
  import Plane from "./Plane.svelte";

  let { area, children, ...rest } = $props();

  const classes = [...(rest.classes || []), ];

</script>

<Plane {classes} {...rest}>
  {@render children?.()}
</Plane>
