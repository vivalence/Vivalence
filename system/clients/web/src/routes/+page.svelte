<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  import { auth } from "@client/auth";

  import { Text, Button, Input } from "@vivalence/interface";
  import { Alert } from "@client/shadcn/components/ui/alert/index.js";

  let username = $state("finn");
  let password = $state("biggusdickus");

  const submit = async (e) => {
    await auth.login(username, password);
    if (auth.isIdentified) goto("/");
    else console.log("not logged in");
  };
</script>

<div class="bsp-node container mx-auto flex flex-col items-center h-full py-24">
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
