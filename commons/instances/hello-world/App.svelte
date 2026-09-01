<script>
  import { Card, Header, Button, Paragraph, Tag } from "@vivalence/drapes";

  let { terminal, daemon, mode } = $props();

  let greeting = $state("");

  async function bot() {
    greeting = (await mode.call.hello.bot()).greeting;
  }

  async function agent() {
    greeting = (await mode.call.hello.agent({ user: "Hello." })).greeting;
  }
</script>

<Card padding="md" class="flex flex-col gap-3">
  <Header as="h1" size="xl">hello world</Header>
  <div class="flex gap-2">
    <Button size="sm" onclick={bot}>bot</Button>
    <Button size="sm" variant="secondary" onclick={agent}>agent</Button>
  </div>
  <Paragraph>{greeting}</Paragraph>
  <div class="flex flex-wrap gap-1">
    {#await daemon.entities.mode.find() then modes}
      {#each modes as entry}
        <Tag size="sm">{entry.type}/{entry.slug}</Tag>
      {/each}
    {/await}
  </div>
</Card>
