<script>
  import { onMount } from "svelte";
  import { Text, Button, Input } from "@vivalence/drapes";

  let username = $state("beef");
  let password = $state("biggusdickus");

  let { lighthouse } = $props();

  const submit = (e) => {
    lighthouse.login(username, password);
  };
</script>

<div class="bsp-node">
  <Input placeholder="Name" bind:value={username} />
  <Input placeholder="Password" type="password" bind:value={password} />
  <div>
    <Button onclick={submit}>Login</Button>
  </div>
</div>
