<script>
  let {
    snug,
    greedy, // self behavior

    children,
    classes = [],
    ...rest
  } = $props();

  //
  classes = [
    //
    "bsp-node",
    ...classes,
    rest.class,
  ];
  // if (snug) classes.push("auto");

  // console.log("plane", classes);

  // const sizing = snug ? "auto" : greedy ? "1fr" : share ? `${share}fr` : w ? `${w}px` : h ? `${h}px` : ""
</script>

<div class={classes.filter(Boolean).join(" ")}>
  {@render children?.()}
</div>

<style>
  /* .x {display: grid;} */
</style>
