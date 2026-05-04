<script>
  import { Header, Paragraph } from "@vivalence/drapes";
  import { Card, Modeline, Icon, Loader, Desk } from "@vivalence/drapes";
  import { Button, Text, Textarea } from "@vivalence/drapes";

  let modalineText = $state("System ready");
  let deskInput = $state("");
  let submitting = $state(false);

  async function handleDeskSubmit() {
    submitting = true;
    modalineText = `Processing: ${deskInput}`;
    
    // Simulate async work
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    modalineText = `Completed: ${deskInput}`;
    deskInput = "";
    submitting = false;
  }
</script>

<div class="max-w-3xl space-y-12">

  <div>
    <Header size="3xl">Panels</Header>
    <Paragraph class="mt-2">
      Composite components and specialized layouts.
    </Paragraph>
  </div>

  <!-- Card Component -->
  <section class="space-y-4">
    <Header size="2xl">Card</Header>
    <Paragraph>
      Flexible container component with variants and padding options.
    </Paragraph>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Variants
      </Paragraph>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-skeleton-2-surface rounded">
        <Card variant="default" padding="md">
          <Text weight="medium">Default Card</Text>
          <Text size="sm" class="mt-2">With default styling</Text>
        </Card>
        <Card variant="secondary" padding="md">
          <Text weight="medium">Secondary Card</Text>
          <Text size="sm" class="mt-2">Alternative surface</Text>
        </Card>
        <Card variant="ghost" padding="md">
          <Text weight="medium">Ghost Card</Text>
          <Text size="sm" class="mt-2">No background</Text>
        </Card>
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Padding
      </Paragraph>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-skeleton-2-surface rounded">
        <Card padding="none">
          <Text size="sm">No padding</Text>
        </Card>
        <Card padding="sm">
          <Text size="sm">Small padding</Text>
        </Card>
        <Card padding="md">
          <Text size="sm">Medium padding</Text>
        </Card>
        <Card padding="lg">
          <Text size="sm">Large padding</Text>
        </Card>
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Interactive & Hover
      </Paragraph>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-skeleton-2-surface rounded">
        <Card hover padding="md">
          <Text weight="medium">Hover Effect</Text>
          <Text size="sm" class="mt-2">Lifts on hover</Text>
        </Card>
        <Card 
          hover 
          padding="md"
          onclick={() => alert('Card clicked!')}
        >
          <Text weight="medium">Clickable Card</Text>
          <Text size="sm" class="mt-2">Try clicking</Text>
        </Card>
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        States
      </Paragraph>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-skeleton-2-surface rounded">
        <Card padding="md" disabled>
          <Text weight="medium">Disabled Card</Text>
          <Text size="sm" class="mt-2">Cannot interact</Text>
        </Card>
      </div>
    </div>
  </section>

  <!-- Icon Component -->
  <section class="space-y-4">
    <Header size="2xl">Icon</Header>
    <Paragraph>
      Icon wrapper supporting Carbon icons and emoji.
    </Paragraph>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Carbon Icons
      </Paragraph>
      <div class="flex flex-wrap items-center gap-4 p-4 bg-skeleton-2-surface rounded">
        <Icon carbon="Add" size="sm" variant="ui" />
        <Icon carbon="ChevronLeft" size="md" variant="ui" />
        <Icon carbon="ChevronRight" size="lg" variant="ui" />
        <Icon carbon="Cube" size="xl" variant="ui" />
        <Icon carbon="CheckmarkOutline" size="md" variant="success" />
        <Icon carbon="SendAlt" size="md" variant="nav" />
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Emoji Icons
      </Paragraph>
      <div class="flex flex-wrap items-center gap-4 p-4 bg-skeleton-2-surface rounded">
        <Icon emoji="🚀" size="md" />
        <Icon emoji="⚡" size="lg" />
        <Icon emoji="🎨" size="xl" />
        <Icon emoji="🔥" size="2xl" />
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Sizes
      </Paragraph>
      <div class="flex flex-wrap items-center gap-4 p-4 bg-skeleton-2-surface rounded">
        <Icon carbon="Cube" size="xs" variant="ui" />
        <Icon carbon="Cube" size="sm" variant="ui" />
        <Icon carbon="Cube" size="md" variant="ui" />
        <Icon carbon="Cube" size="lg" variant="ui" />
        <Icon carbon="Cube" size="xl" variant="ui" />
      </div>
    </div>
  </section>

  <!-- Modeline Component -->
  <section class="space-y-4">
    <Header size="2xl">Modeline</Header>
    <Paragraph>
      Three-zone status bar component (left, center, right).
    </Paragraph>

    <div class="space-y-3">
      <div class="p-4 bg-skeleton-2-surface rounded">
        <Modeline size="sm">
          {#snippet left()}
            <Icon emoji="📄" size="sm" />
            <Text size="sm" class="ml-2">document.txt</Text>
          {/snippet}
          {#snippet center()}
            <Text size="sm">{modalineText}</Text>
          {/snippet}
          {#snippet right()}
            <Text size="sm">Ln 42, Col 12</Text>
          {/snippet}
        </Modeline>
      </div>

      <div class="p-4 bg-skeleton-2-surface rounded">
        <Modeline size="md">
          {#snippet left()}
            <Button size="sm" variant="secondary">File</Button>
            <Button size="sm" variant="secondary">Edit</Button>
          {/snippet}
          {#snippet center()}
            <Text weight="medium">Vivalence Editor</Text>
          {/snippet}
          {#snippet right()}
            <Icon carbon="Add" size="sm" variant="ui" />
            <Icon carbon="Cognitive" size="sm" variant="ui" />
          {/snippet}
        </Modeline>
      </div>

      <div class="p-4 bg-skeleton-2-surface rounded">
        <Modeline size="lg">
          {#snippet left()}
            <Icon emoji="⚙️" size="md" />
          {/snippet}
          {#snippet center()}
            <Text size="lg" weight="medium">Settings</Text>
          {/snippet}
          {#snippet right()}
            <Button size="sm">Save</Button>
          {/snippet}
        </Modeline>
      </div>
    </div>
  </section>

  <!-- Loader Component -->
  <section class="space-y-4">
    <Header size="2xl">Loader</Header>
    <Paragraph>
      Animated loading indicator with motivational messages.
    </Paragraph>

    <div class="p-8 bg-skeleton-2-surface rounded">
      <Loader time={{ minimum: 3000, variance: 1000 }} />
    </div>

    <Paragraph size="sm" class="text-skeleton-2-contrast">
      The loader cycles through encouraging messages while loading. 
      Configure timing with minimum and variance options.
    </Paragraph>
  </section>

  <!-- Desk Component -->
  <section class="space-y-4">
    <Header size="2xl">Desk</Header>
    <Paragraph>
      Chat-style interface with input area and content display.
    </Paragraph>

    <div class="border border-skeleton-1-boundary rounded overflow-hidden">
      <Desk 
        bind:input={deskInput}
        onSubmit={handleDeskSubmit}
      >
        <div class="p-8 space-y-4">
          <Card padding="md">
            <Text>Welcome to the desk interface!</Text>
          </Card>
          <Card padding="md" variant="secondary">
            <Text>Type a message below and submit.</Text>
          </Card>
          {#if submitting}
            <Card padding="md" variant="default">
              <Text>Processing your input...</Text>
            </Card>
          {/if}
        </div>
      </Desk>
    </div>
  </section>

</div>
