<script>
  let { row } = $props();
  let held = $state(null);
  $effect(() => {
    if (held === null) held = { ...row, seen: 1 };
  });
</script>

<pre>{JSON.stringify(held, null, 2)}</pre>
