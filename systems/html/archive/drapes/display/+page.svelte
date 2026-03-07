<script>
  import { Header, Paragraph, Label, Tag } from "@vivalence/drapes";
  import { Button } from "@vivalence/drapes";

  let tags = $state([
    { id: 1, text: "Design", variant: "primary" },
    { id: 2, text: "Development", variant: "secondary" },
    { id: 3, text: "Research", variant: "accent" },
  ]);

  function removeTag(id) {
    tags = tags.filter(t => t.id !== id);
  }
</script>

<div class="max-w-3xl space-y-12">

  <div>
    <Header size="3xl">Display</Header>
    <Paragraph class="mt-2">
      Components for displaying information and content structure.
    </Paragraph>
  </div>

  <!-- Header Component -->
  <section class="space-y-4">
    <Header size="2xl">Header</Header>
    <Paragraph>
      Semantic heading component with optional actions slot.
    </Paragraph>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Sizes
      </Paragraph>
      <div class="space-y-3 p-4 bg-skeleton-2-surface rounded">
        <Header size="sm">Small header</Header>
        <Header size="md">Medium header</Header>
        <Header size="lg">Large header</Header>
        <Header size="xl">Extra large header</Header>
        <Header size="2xl">2XL header</Header>
        <Header size="3xl">3XL header</Header>
        <Header size="4xl">4XL header</Header>
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        With Actions
      </Paragraph>
      <div class="space-y-3 p-4 bg-skeleton-2-surface rounded">
        <Header size="xl">
          Settings
          {#snippet actions()}
            <Button size="sm" variant="secondary">Edit</Button>
            <Button size="sm" variant="primary">Save</Button>
          {/snippet}
        </Header>
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Semantic HTML (as prop)
      </Paragraph>
      <div class="space-y-2 p-4 bg-skeleton-2-surface rounded">
        <Header as="h1" size="4xl">H1 Heading</Header>
        <Header as="h2" size="3xl">H2 Heading</Header>
        <Header as="h3" size="2xl">H3 Heading</Header>
        <Header as="h4" size="xl">H4 Heading</Header>
      </div>
    </div>
  </section>

  <!-- Paragraph Component -->
  <section class="space-y-4">
    <Header size="2xl">Paragraph</Header>
    <Paragraph>
      Semantic prose component with size variants.
    </Paragraph>

    <div class="space-y-3 p-4 bg-skeleton-2-surface rounded">
      <Paragraph size="sm">
        Small paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </Paragraph>
      <Paragraph size="md">
        Medium paragraph text (default). Lorem ipsum dolor sit amet, consectetur 
        adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </Paragraph>
      <Paragraph size="lg">
        Large paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </Paragraph>
    </div>
  </section>

  <!-- Label Component -->
  <section class="space-y-4">
    <Header size="2xl">Label</Header>
    <Paragraph>
      Form label component with required indicator support.
    </Paragraph>

    <div class="space-y-3 p-4 bg-skeleton-2-surface rounded">
      <div>
        <Label>Standard label</Label>
      </div>
      <div>
        <Label required>Required field label</Label>
      </div>
      <div>
        <Label size="sm">Small label</Label>
      </div>
      <div>
        <Label size="md">Medium label</Label>
      </div>
      <div>
        <Label size="lg">Large label</Label>
      </div>
    </div>
  </section>

  <!-- Tag Component -->
  <section class="space-y-4">
    <Header size="2xl">Tag</Header>
    <Paragraph>
      Pill-shaped labels for categorization and status indication.
    </Paragraph>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Variants
      </Paragraph>
      <div class="flex flex-wrap gap-2 p-4 bg-skeleton-2-surface rounded">
        <Tag variant="default">Default</Tag>
        <Tag variant="primary">Primary</Tag>
        <Tag variant="secondary">Secondary</Tag>
        <Tag variant="accent">Accent</Tag>
        <Tag variant="info">Info</Tag>
        <Tag variant="success">Success</Tag>
        <Tag variant="warning">Warning</Tag>
        <Tag variant="danger">Danger</Tag>
        <Tag variant="error">Error</Tag>
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Sizes
      </Paragraph>
      <div class="flex flex-wrap items-center gap-2 p-4 bg-skeleton-2-surface rounded">
        <Tag size="xs" variant="primary">XS</Tag>
        <Tag size="sm" variant="primary">SM</Tag>
        <Tag size="md" variant="primary">MD</Tag>
        <Tag size="lg" variant="primary">LG</Tag>
      </div>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Removable Tags
      </Paragraph>
      <div class="flex flex-wrap gap-2 p-4 bg-skeleton-2-surface rounded">
        {#each tags as tag (tag.id)}
          <Tag 
            variant={tag.variant}
            removable
            onRemove={() => removeTag(tag.id)}
          >
            {tag.text}
          </Tag>
        {/each}
      </div>
      <Paragraph size="sm" class="mt-2">
        Click the × to remove tags
      </Paragraph>
    </div>

    <div>
      <Paragraph size="sm" class="mb-3 text-skeleton-2-contrast">
        Interactive Tags
      </Paragraph>
      <div class="flex flex-wrap gap-2 p-4 bg-skeleton-2-surface rounded">
        <Tag 
          variant="secondary" 
          onclick={() => alert('Tag clicked!')}
          class="cursor-pointer hover:opacity-80"
        >
          Clickable
        </Tag>
      </div>
    </div>
  </section>

</div>
