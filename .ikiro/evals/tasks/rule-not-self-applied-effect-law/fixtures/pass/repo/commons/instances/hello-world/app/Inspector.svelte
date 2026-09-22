<script>
  let { row } = $props();
  let held = $derived({ ...row, seen: Date.now() });
</script>

<pre>{JSON.stringify(held, null, 2)}</pre>
