<script>
  import { Card, Icon, Loader, Desk } from "@vivalence/drapes";
  import { Button, Text, Textarea, Paragraph } from "@vivalence/drapes";
  import Page from "../_Page.svelte";
  import Section from "../_Section.svelte";
  import Demo from "../_Demo.svelte";

  let deskInput = $state("");
  let submitting = $state(false);

  async function handleDeskSubmit() {
    submitting = true;
    await new Promise(resolve => setTimeout(resolve, 2000));
    deskInput = "";
    submitting = false;
  }

  const carbonIcons = [
    ["Add","sm","ui"], ["ChevronLeft","md","ui"], ["ChevronRight","lg","ui"],
    ["Cube","xl","ui"], ["CheckmarkOutline","md","success"], ["SendAlt","md","nav"],
  ];
</script>

<Page title="Panels" description="Composite components and specialized layouts.">

  <Section title="Card" description="Flexible container component with variants and padding options.">
    <Demo label="Variants" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      {#each [["default","Default"],["secondary","Secondary"],["ghost","Ghost"]] as [v, label]}
        <Card variant={v} padding="md">
          <Text weight="medium">{label} Card</Text>
          <Text size="sm" class="mt-2">{v === "ghost" ? "No background" : v === "secondary" ? "Alternative surface" : "With default styling"}</Text>
        </Card>
      {/each}
    </Demo>

    <Demo label="Padding" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each ["none","sm","md","lg"] as p}
        <Card padding={p}><Text size="sm">{p[0].toUpperCase() + p.slice(1)} padding</Text></Card>
      {/each}
    </Demo>

    <Demo label="Interactive & Hover" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card hover padding="md">
        <Text weight="medium">Hover Effect</Text>
        <Text size="sm" class="mt-2">Lifts on hover</Text>
      </Card>
      <Card hover padding="md" onclick={() => alert('Card clicked!')}>
        <Text weight="medium">Clickable Card</Text>
        <Text size="sm" class="mt-2">Try clicking</Text>
      </Card>
    </Demo>

    <Demo label="States" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card padding="md" disabled>
        <Text weight="medium">Disabled Card</Text>
        <Text size="sm" class="mt-2">Cannot interact</Text>
      </Card>
    </Demo>
  </Section>

  <Section title="Icon" description="Icon wrapper supporting Carbon icons and emoji.">
    <Demo label="Carbon Icons" class="flex flex-wrap items-center gap-4">
      {#each carbonIcons as [carbon, size, variant]}
        <Icon {carbon} {size} {variant} />
      {/each}
    </Demo>

    <Demo label="Emoji Icons" class="flex flex-wrap items-center gap-4">
      {#each [["🚀","md"],["⚡","lg"],["🎨","xl"],["🔥","2xl"]] as [emoji, size]}
        <Icon {emoji} {size} />
      {/each}
    </Demo>

    <Demo label="Sizes" class="flex flex-wrap items-center gap-4">
      {#each ["xs","sm","md","lg","xl"] as s}
        <Icon carbon="Cube" size={s} variant="ui" />
      {/each}
    </Demo>
  </Section>

  <Section title="Loader" description="Animated loading indicator with motivational messages.">
    <Demo class="p-8">
      <Loader time={{ minimum: 3000, variance: 1000 }} />
    </Demo>
    <Paragraph size="sm" class="text-skeleton-2-contrast">
      Cycles through encouraging messages. Configure with minimum and variance.
    </Paragraph>
  </Section>

  <Section title="Desk" description="Chat-style interface with input area and content display.">
    <div class="border border-skeleton-1-boundary rounded overflow-hidden">
      <Desk bind:input={deskInput} onSubmit={handleDeskSubmit}>
        <div class="p-8 space-y-4">
          <Card padding="md"><Text>Welcome to the desk interface!</Text></Card>
          <Card padding="md" variant="secondary"><Text>Type a message below and submit.</Text></Card>
          {#if submitting}
            <Card padding="md"><Text>Processing your input...</Text></Card>
          {/if}
        </div>
      </Desk>
    </div>
  </Section>

</Page>
