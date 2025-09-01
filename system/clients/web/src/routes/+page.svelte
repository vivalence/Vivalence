<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { get } from "svelte/store";

  import { isIdentified, login, lighthouse } from "@client/app";
  import { Text, Button, Input } from "@vivalence/interface";
  import ServiceStatus from "@client/views/service/ServiceStatusCard.svelte";

  let username = $state("beef");
  let password = $state("biggusdickus");

  const submit = async (e) => {
    await login(username, password);
    if (isIdentified()) goto("/viva");
    else console.log("not logged in");
  };
</script>

<div class="bsp-node h2 items-center px-24 debug-*">
  <div class="bsp-node h2">
    <div class="text-center">
      <Text weight="bold" size="2xl">login</Text>
    </div>
    <div>
      <ServiceStatus service={lighthouse} />
    </div>
  </div>
  <div class="bsp-node">
    <Input placeholder="Name" bind:value={username} />
    <Input placeholder="Password" type="password" bind:value={password} />
    <div>
      <Button onclick={submit}>Login</Button>
    </div>
  </div>
</div>
