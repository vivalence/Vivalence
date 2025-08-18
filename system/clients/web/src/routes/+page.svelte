<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  import { authority } from "@client/authority";

  import { Text, Button, Input } from "@vivalence/interface";
  import { Alert } from "@client/shadcn/components/ui/alert/index.js";

  let username = $state("beef");
  let password = $state("biggusdickus");

  const submit = async (e) => {
    await authority.login(username, password);
    if (authority.isIdentified) goto("/");
    else console.log("not logged in");
  };
</script>

<div class="bsp-node h2 items-center px-24 debug-*">
  <div class="bsp-node text-center">
    <Text weight="bold" size="2xl">login</Text>
  </div>
  <div class="bsp-node">
    <Input placeholder="Name" bind:value={username} />
    <Input placeholder="Password" type="password" bind:value={password} />
    <div>
      <Button onclick={submit}>Login</Button>
    </div>
  </div>
</div>
