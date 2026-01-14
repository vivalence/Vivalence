<script>
  import Plane from "./Plane.svelte";
  let {
    split, // subspace separation
    areas, // templates

    across,
    down, // directionality

    children,
    classes = [],
    ...rest
  } = $props();

  const direction = across ? "grid-flow-col" : down ? "grid-flow-row" : "";
  classes.push(direction);
  console.log({ across, down, direction, classes });

  // <Shelf across split={["auto", "1fr"]}> <Shelf across split={[200, "1fr", 300]}>
  // console.log("shelve to plane ", classes, rest);
</script>

<Plane {classes} {...rest}>
  {@render children?.()}
</Plane>
