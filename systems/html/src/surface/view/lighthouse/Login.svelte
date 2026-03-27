<script>
  import { Text, Button, Input } from "@vivalence/drapes";

  let username = $state("");
  let password = $state("");

  let { lighthouse } = $props();

  const status = lighthouse.$status;

  const busy = $derived(["AUTHENTICATING", "VERIFYING", "REFRESHING"].includes($status.code));

  const submit = (e) => {
    if (busy) return;
    lighthouse.login(username, password);
  };
</script>

<div class="flex flex-col gap-4">
  <Input placeholder="Name" bind:value={username} disabled={busy} />
  <Input placeholder="Password" type="password" bind:value={password} disabled={busy} />

  {#if $status.code === "ERROR" || $status.code === "SESSION_EXPIRED" || $status.code === "OFFLINE"}
    <Text size="xs" color="system-error">
      {$status.message ??
        ($status.code === "SESSION_EXPIRED"
          ? "session expired"
          : $status.code === "OFFLINE"
            ? "network unavailable"
            : "login failed")}
    </Text>
  {/if}

  <div>
    <Button onclick={submit} loading={busy} disabled={busy}>Login</Button>
  </div>
</div>

<!-- <script> -->
<!--   import { onMount } from "svelte"; -->
<!--   import { Text, Button, Input } from "@vivalence/drapes"; -->

<!--   let username = $state("beef"); -->
<!--   let password = $state("biggusdickus"); -->

<!--   let { lighthouse } = $props(); -->

<!--   const submit = (e) => { -->
<!--     lighthouse.login(username, password); -->
<!--   }; -->
<!-- </script> -->

<!-- <div class="bsp-node v3 gap-4"> -->
<!--   <div class="text-center space-y-2"> -->
<!--     <Text variant="heading" size="xl" weight="medium" color="palette-gray-100"> -->
<!--       Access Terminal -->
<!--     </Text> -->
<!--     <Text variant="text" size="sm" color="palette-gray-300" class="opacity-80"> -->
<!--       Authenticate to continue -->
<!--     </Text> -->
<!--   </div> -->

<!--   <div class="space-y-4"> -->
<!--     <Input  -->
<!--       placeholder="Identity"  -->
<!--       bind:value={username} -->
<!--       variant="primary" -->
<!--       size="md" /> -->

<!--     <Input  -->
<!--       placeholder="Passphrase"  -->
<!--       type="password"  -->
<!--       bind:value={password} -->
<!--       variant="primary"  -->
<!--       size="md" /> -->
<!--   </div> -->

<!--   <div class="space-y-3"> -->
<!--     <Button  -->
<!--       onclick={submit} -->
<!--       variant="primary" -->
<!--       size="md" -->
<!--       class="w-full"> -->
<!--       <Text variant="text" size="sm" weight="medium"> -->
<!--         Initialize Connection -->
<!--       </Text> -->
<!--     </Button> -->

<!--     <Text variant="text" size="xs" color="palette-gray-400" class="text-center opacity-60"> -->
<!--       homini finem sui · hominibus telam mundi -->
<!--     </Text> -->
<!--   </div> -->
<!-- </div> -->
