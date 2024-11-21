<script>
  import { Input, Text, Button } from "@vivalence/ui";

  let email = $state("");
  let password = $state("");

  let { form } = $props();
</script>

<div class="flex flex-col container py-4">
  <Text variant="header" size="xl">Login</Text>

  <form method="POST" action="?/signin">
    <Input name="email" autocomplete="email" placeholder="Email" type="email" bind:value={email} />
    <Input name="password" placeholder="Password" type="password" />
    <Button>Login</Button>
  </form>

  {#if form?.message}
    <Text>{form.message}</Text>
  {/if}
  {#if form?.error}
    <Text color="danger">{form.error}</Text>
  {/if}
</div>
