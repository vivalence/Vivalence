<script>
  let { init } = $props();

  let container = $state(null);

  $effect(() => {
    if (!container) return;
    let api;

    (async () => {
      api = await init(container);
    })();

    const observer = new ResizeObserver(() => api?.resize?.());
    observer.observe(container);

    return () => {
      observer.disconnect();
      api?.dispose?.();
    };
  });
</script>

<div bind:this={container} style="width:100%;height:100%;min-height:200px;"></div>
