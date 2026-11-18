<script>
  import { onMount, onDestroy } from "svelte";

  let cleanup;

  onMount(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    let raf = false;
    function sync() {
      if (raf) return;
      raf = true;
      requestAnimationFrame(() => {
        const s = document.documentElement.style;
        s.setProperty('--viva-h', vv.height + 'px');
        s.setProperty('--viva-t', vv.offsetTop + 'px');
        raf = false;
      });
    }

    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    sync();

    cleanup = () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
      document.documentElement.style.removeProperty('--viva-h');
      document.documentElement.style.removeProperty('--viva-t');
    };
  });

  onDestroy(() => cleanup?.());
</script>
