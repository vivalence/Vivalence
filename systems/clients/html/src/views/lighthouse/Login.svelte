<script>
  import { onMount } from "svelte";
  import { Text, Button, Input } from "@vivalence/interface";

  let username = $state("beef");
  let password = $state("biggusdickus");

  let { lighthouse } = $props();
  console.log(lighthouse);

  const submit = async (e) => {
    console.log(e);
    console.log("LOGIN", await lighthouse.login(username, password));
    console.log(lighthouse);
    // if (lighthouse.isIdentified()) goto("/viva"); else console.log("not logged in");
  };
</script>

<div class="bsp-node">
  <Input placeholder="Name" bind:value={username} />
  <Input placeholder="Password" type="password" bind:value={password} />
  <div>
    <Button onclick={submit}>Login</Button>
  </div>
</div>
